import { useState } from 'react';
import * as React from 'react';
import { Toaster } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { Globe, Gear as Settings, X } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CollaborativeProvider } from '@/contexts/CollaborativeContext';
import { CollaborativeManager } from '@/components/collaborative';
import { TypographyProvider } from '@/contexts/TypographyContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LoginForm } from '@/components/auth/LoginForm';
import { RegisterForm, UserProfilePage, SmartRecommendationDashboard } from '@/components/membership';
import { UserManagementDashboard } from '@/components/user-management';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { RoleBasedDashboard } from '@/components/dashboard/RoleBasedDashboard';
import { PublicInterface } from '@/components/public';
import { AdvancedAnalytics, AnalyticsDashboard, InteractiveAnalytics, RealTimeAnalytics, PerformanceInsights, CategoryAnalytics, UserBehaviorAnalytics, ReadingPatternAnalyzer, PredictiveUserAnalytics } from '@/components/analytics';
import { ComprehensiveArticleModule } from '@/components/articles';
import { ComprehensiveDeepAnalysisModule } from '@/components/analysis';
import { ComprehensiveArticleEditor } from '@/components/editor/ComprehensiveArticleEditor';
import { AIOptimizationEngine } from '@/components/optimization/AIOptimizationEngine';
import { ABTestingFramework } from '@/components/optimization/ABTestingFramework';
import { TypographySettings, GeneralSettings, ThemeColorSettings, AdaptiveLearningSettings, PersonalizedReadingEngine, UserAdaptiveLearningSettings } from '@/components/settings';
import { TypographyShowcase } from '@/components/showcase/TypographyShowcase';
import { ThemeTestingShowcase } from '@/components/showcase/ThemeTestingShowcase';
import { LiveThemePreview } from '@/components/showcase/LiveThemePreview';
import { ThemeImportExport } from '@/components/showcase/ThemeImportExport';
import { ComprehensiveThemeManager, AutoThemeScheduler, InteractiveThemeDemo } from '@/components/showcase';
import { PersonalizedThemeManager, UserProfileTheme, PersonalizedThemesDashboard, IntelligentThemeGenerator, BehavioralThemeLearningSystem, AdaptiveColorLearningSystem, AdaptiveLearningDashboard, AdaptiveColorDemo } from '@/components/themes';
import { SmartThemeApplicator } from '@/components/themes/SmartThemeApplicator';
import { MediaUpload, MediaGenerator, ComprehensiveMediaManager } from '@/components/media';
import { AudioEditor, AudioLibrary, AudioAnalytics } from '@/components/audio';
import { SystemAnalysis, ComprehensiveAnalysisEngine } from '@/components/analysis';
import { AISearch, ComprehensiveSearch } from '@/components/search';
import { AIRecommendationEngine } from '@/components/recommendations/AIRecommendationEngine';
import { MachineLearningEngine } from '@/components/recommendations/MachineLearningEngine';
import { SmartRecommendationSystem } from '@/components/recommendations/SmartRecommendationSystem';
import { PersonalizedRecommendations } from '@/components/recommendations/PersonalizedRecommendations';
import { PersonalizedFeedEngine } from '@/components/recommendations/PersonalizedFeedEngine';
import { RecommendationEvaluation, RecommendationInsights, RecommendationDashboard, RecommendationSystemOverview, GenerativeAIRecommendationSystem, SmartContentPersonalizationEngine, AITrendAnalysisSystem } from '@/components/recommendations';
import { ReadingBehaviorTracker } from '@/components/analytics/ReadingBehaviorTracker';
import { ContentModeration } from '@/components/moderation/ContentModeration';
import { ArabicSentimentAnalyzer, SentimentDashboard, AutoSentimentModeration } from '@/components/sentiment';
import { SchedulingCalendar } from '@/components/scheduling';
import { CategoryManager, CategoryStatistics, ComprehensiveCategoryManager } from '@/components/categories';
import { LoyaltySystem } from '@/components/loyalty';
import { DailyDosesManager } from '@/components/doses';
import { PodcastDemo, ArabicNeuralNetworkDemo } from '@/components/demo';
import { ErrorChecker } from '@/components/debug/ErrorChecker';
import { ErrorBoundary } from '@/components/debug/ErrorBoundary';
import { RuntimeErrorBoundary } from '@/components/debug/RuntimeErrorBoundary';
import { RuntimeChecker } from '@/components/debug/RuntimeChecker';
import { ReadingPreferencePrediction, AdvancedMLModelTraining, PredictiveBehaviorEngine, NeuralNetworkTrainer, TransformerTrainingStudio, DeepLearningPipelineManager, ArabicContentClassifier } from '@/components/ml';
import { ExternalDataManager, NewsAggregator } from '@/components/external';
import { BreakingNewsNotifications, NotificationCenter, LiveNotificationBanner, NotificationPreferences, NotificationAnalytics, SmartNotificationSystem } from '@/components/notifications';
import { AutoResourceOptimizerDashboard, ResourceOptimizationConfig, PerformanceOptimizationDemo, AutoResourceOptimizationOverview } from '@/components/optimization';
import { PerformanceDashboard, EnhancedPerformanceDashboard } from '@/components/performance';
import { SystemStatus } from '@/components/system';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { mockArticles, mockCategories, mockMediaFiles } from '@/lib/mockData';
import { normalizeArticles, normalizeDataObject, cn } from '@/lib/utils';
import { UserProfile } from '@/types/membership';
import { initializeGlobalErrorHandler } from '@/lib/globalErrorHandler';
import { 
  MemoryManager, 
  PerformanceMonitor, 
  usePerformanceMonitor, 
  useMemoryCleanup, 
  useDebouncedCallback,
  DataCache,
  initializePerformanceOptimizer 
} from '@/lib/performanceOptimizer';
import { 
  initializeAutoResourceOptimizer,
  useResourceOptimization 
} from '@/lib/autoResourceOptimizer';

// Initialize global error handler for date formatting issues
initializeGlobalErrorHandler();

// Initialize performance optimization system
initializePerformanceOptimizer();

// Initialize auto resource optimizer
initializeAutoResourceOptimizer();

function AppContent() {
  // Performance monitoring for this component
  usePerformanceMonitor('AppContent');
  useResourceOptimization('AppContent');
  
  const { isAuthenticated, user, canAccess, language } = useAuth();
  const isRTL = language.direction === 'rtl';
  const isArabic = language.code === 'ar';
  
  // Update document direction and title when language changes
  React.useEffect(() => {
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', language.code);
    
    // Update page title based on language
    document.title = isArabic ? 'سبق الذكية - نظام إدارة المحتوى الذكي' : 'Sabq Althakiyah - AI-Powered CMS';
    
    // Simple and effective zoom control
    const resetZoom = () => {
      document.documentElement.style.zoom = "1";
      document.body.style.zoom = "1";
      document.documentElement.style.transform = "none";
      document.body.style.transform = "none";
    };
    
    resetZoom();
    
    // Ensure viewport meta is properly set
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no, shrink-to-fit=no, viewport-fit=cover');
    }
  }, [isRTL, language.code, isArabic]);
  
  const [activeView, setActiveView] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<Article | undefined>();
  
  // Cached and normalized articles with performance optimization
  const [rawArticles, setRawArticles] = useKV<Article[]>('sabq-articles', mockArticles);
  const articles = normalizeArticles(normalizeDataObject(rawArticles || []));
  const [isPublicView, setIsPublicView] = useState(false);
  
  // Initialize media files
  const [mediaFiles, setMediaFiles] = useKV('sabq-media-files', mockMediaFiles);
  
  // Membership system state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [memberUser, setMemberUser] = useKV<UserProfile | null>('current-member-user', null);
  
  // Performance optimized callback functions
  const setArticles = useDebouncedCallback((updater: (currentArticles: Article[]) => Article[]) => {
    setRawArticles(currentArticles => {
      const normalized = normalizeArticles(normalizeDataObject(currentArticles || []));
      return updater(normalized);
    });
  }, 300);

  // Memory cleanup for component lifecycle
  useMemoryCleanup(() => {
    // Cleanup any subscriptions, timers, etc.
    DataCache.clear();
    console.log('AppContent: Memory cleanup performed');
  });

  // Simple zoom control effect
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      // Periodically ensure zoom is maintained at 1
      if (document.documentElement.style.zoom !== "1") {
        document.documentElement.style.zoom = "1";
      }
      if (document.body.style.zoom !== "1") {
        document.body.style.zoom = "1";
      }
    }, 1000); // Check every second
    
    return () => clearInterval(intervalId);
  }, [activeView]);

  // Membership handlers
  const handleMemberLogin = (userData: UserProfile) => {
    setMemberUser(userData);
    setShowAuthModal(false);
    toast.success(`مرحباً بك ${userData.name}!`);
  };

  const handleMemberRegister = (userData: UserProfile) => {
    setMemberUser(userData);
    setShowAuthModal(false);
    toast.success(`تم إنشاء حسابك بنجاح! مرحباً بك ${userData.name}`);
  };

  const handleMemberLogout = () => {
    setMemberUser(null);
    toast.success('تم تسجيل الخروج بنجاح');
  };

  const handleUpdateProfile = (updates: Partial<UserProfile>) => {
    if (memberUser) {
      setMemberUser(prev => ({ ...prev!, ...updates }));
      toast.success('تم تحديث الملف الشخصي');
    }
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
          <ComprehensiveArticleModule 
            onEditArticle={handleEditArticle}
            onCreateNew={handleCreateNew}
          />
        );
      
      case 'deep-analysis':
        return (
          <ComprehensiveDeepAnalysisModule 
            article={editingArticle}
            onAnalysisComplete={(analysis) => {
              console.log('Analysis completed:', analysis);
              toast.success('تم إكمال التحليل العميق');
            }}
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
      
      case 'smart-recommendation-system':
        return memberUser ? (
          <SmartRecommendationSystem
            userId={memberUser.id}
            articles={articles}
            onArticleSelect={handleEditArticle}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">نظام التوصيات الذكي المتطور</h2>
            <p className="text-muted-foreground mt-2">يرجى تسجيل الدخول للوصول للنظام الذكي</p>
            <Button className="mt-4" onClick={() => setShowAuthModal(true)}>
              تسجيل الدخول
            </Button>
          </div>
        );

      case 'machine-learning-engine':
        return memberUser ? (
          <MachineLearningEngine
            userId={memberUser.id}
            articles={articles}
            onArticleSelect={handleEditArticle}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">محرك التعلم الآلي</h2>
            <p className="text-muted-foreground mt-2">يرجى تسجيل الدخول للوصول لمحرك التعلم الآلي</p>
            <Button className="mt-4" onClick={() => setShowAuthModal(true)}>
              تسجيل الدخول
            </Button>
          </div>
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
        return <SystemStatus />;
      
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
        return <UserManagementDashboard />;
      
      case 'theme-settings':
        return <ThemeColorSettings />;
      
      case 'adaptive-learning-settings':
        return memberUser ? (
          <AdaptiveLearningSettings
            userId={memberUser.id}
            onSettingsChange={(config) => {
              console.log('Adaptive learning settings changed:', config);
              toast.success('تم حفظ إعدادات التعلم التكيفي');
            }}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">إعدادات التعلم التكيفي</h2>
            <p className="text-muted-foreground mt-2">يرجى تسجيل الدخول لإعداد التعلم التكيفي</p>
            <Button className="mt-4" onClick={() => setShowAuthModal(true)}>
              تسجيل الدخول
            </Button>
          </div>
        );

      case 'personalized-reading':
        return memberUser ? (
          <PersonalizedReadingEngine
            userId={memberUser.id}
            onPreferencesChange={(preferences) => {
              console.log('Reading preferences changed:', preferences);
              toast.success('تم حفظ تفضيلات القراءة');
            }}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">محرك القراءة الشخصي</h2>
            <p className="text-muted-foreground mt-2">يرجى تسجيل الدخول لتخصيص تجربة القراءة</p>
            <Button className="mt-4" onClick={() => setShowAuthModal(true)}>
              تسجيل الدخول
            </Button>
          </div>
        );

      case 'settings':
        return <TypographySettings />;
      
      case 'general-settings':
        return <GeneralSettings />;
      
      case 'typography-demo':
        return <TypographyShowcase />;
      
      case 'theme-testing':
        return <ThemeTestingShowcase />;
      
      case 'live-theme-preview':
        return <LiveThemePreview />;
      
      case 'theme-import-export':
        return <ThemeImportExport />;
      
      case 'interactive-theme-demo':
        return <InteractiveThemeDemo />;
      
      case 'comprehensive-theme-manager':
        return <ComprehensiveThemeManager />;
      
      case 'auto-theme-scheduler':
        return <AutoThemeScheduler />;
      
      case 'personalized-themes':
        return (
          <PersonalizedThemeManager 
            userId={user?.id}
            currentUser={user}
          />
        );
      
      case 'user-theme-profile':
        return (
          <UserProfileTheme 
            userId={user?.id || 'guest'}
            onThemeChange={(themeId) => {
              console.log('User changed theme to:', themeId);
              toast.success('تم تطبيق الثيم الشخصي');
            }}
          />
        );
      
      case 'personalized-themes-dashboard':
        return <PersonalizedThemesDashboard />;
      
      case 'intelligent-theme-generator':
        return memberUser ? (
          <IntelligentThemeGenerator
            userId={memberUser.id}
            userProfile={memberUser}
            articles={articles}
            onThemeGenerated={(theme) => {
              console.log('Generated theme:', theme);
              toast.success(`تم توليد ثيم "${theme.nameAr}" بنجاح!`);
            }}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">مولد الثيمات الذكي</h2>
            <p className="text-muted-foreground mt-2">يرجى تسجيل الدخول لتوليد ثيمات مخصصة</p>
            <Button className="mt-4" onClick={() => setShowAuthModal(true)}>
              تسجيل الدخول
            </Button>
          </div>
        );

      case 'adaptive-color-learning':
        return memberUser ? (
          <AdaptiveLearningDashboard
            userId={memberUser.id}
            onSystemToggle={(enabled) => {
              console.log('Adaptive learning system toggled:', enabled);
              toast.success(enabled ? 'تم تفعيل التعلم التكيفي' : 'تم إيقاف التعلم التكيفي');
            }}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">نظام التعلم التكيفي للألوان</h2>
            <p className="text-muted-foreground mt-2">يرجى تسجيل الدخول لتفعيل التعلم التكيفي للألوان</p>
            <Button className="mt-4" onClick={() => setShowAuthModal(true)}>
              تسجيل الدخول
            </Button>
          </div>
        );

      case 'adaptive-color-demo':
        return (
          <AdaptiveColorDemo
            userId={memberUser?.id || 'demo'}
          />
        );
      
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
          <ComprehensiveArticleModule 
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
      
      case 'smart-notifications':
        return memberUser ? (
          <SmartNotificationSystem
            userId={memberUser.id}
            articles={articles}
            userProfile={memberUser}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">الإشعارات الذكية</h2>
            <p className="text-muted-foreground mt-2">يرجى تسجيل الدخول لإعداد الإشعارات الذكية</p>
            <Button className="mt-4" onClick={() => setShowAuthModal(true)}>
              تسجيل الدخول
            </Button>
          </div>
        );
      
      case 'notification-analytics':
        return <NotificationAnalytics />;
      
      case 'member-profile':
        return memberUser ? (
          <UserProfilePage 
            user={memberUser}
            onUpdateProfile={handleUpdateProfile}
            articles={articles}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">الملف الشخصي</h2>
            <p className="text-muted-foreground mt-2">يرجى تسجيل الدخول أولاً</p>
          </div>
        );

      case 'user-adaptive-settings':
        return (
          <UserAdaptiveLearningSettings
            userProfile={memberUser || undefined}
            onSettingsUpdate={(settings) => {
              console.log('User adaptive settings updated:', settings);
              toast.success('تم حفظ إعداداتك الشخصية');
            }}
          />
        );
      
      case 'personalized-feed':
        return memberUser ? (
          <PersonalizedFeedEngine
            userId={memberUser.id}
            articles={articles}
            onArticleSelect={handleEditArticle}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">الخلاصة المخصصة</h2>
            <p className="text-muted-foreground mt-2">يرجى تسجيل الدخول للحصول على خلاصة مخصصة</p>
            <Button className="mt-4" onClick={() => setShowAuthModal(true)}>
              تسجيل الدخول
            </Button>
          </div>
        );
      
      case 'generative-recommendations':
        return (
          <GenerativeAIRecommendationSystem
            onArticleSelect={handleEditArticle}
          />
        );
      
      case 'content-personalization':
        return (
          <SmartContentPersonalizationEngine
            onArticleSelect={handleEditArticle}
          />
        );
      
      case 'ai-trend-analysis':
        return (
          <AITrendAnalysisSystem
            onArticleSelect={handleEditArticle}
          />
        );
      
      case 'reading-behavior':
        return memberUser ? (
          <ReadingBehaviorTracker
            userId={memberUser.id}
            article={editingArticle}
            onBehaviorUpdate={(behavior) => {
              console.log('Behavior updated:', behavior);
            }}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">تتبع سلوك القراءة</h2>
            <p className="text-muted-foreground mt-2">يرجى تسجيل الدخول لتتبع سلوك القراءة</p>
            <Button className="mt-4" onClick={() => setShowAuthModal(true)}>
              تسجيل الدخول
            </Button>
          </div>
        );
      
      case 'user-behavior-analytics':
        return <UserBehaviorAnalytics />;
      
      case 'reading-pattern-analyzer':
        return <ReadingPatternAnalyzer />;
      
      case 'predictive-user-analytics':
        return <PredictiveUserAnalytics />;
      
      case 'performance-dashboard':
        return <EnhancedPerformanceDashboard />;
      
      case 'auto-resource-optimizer':
        return <AutoResourceOptimizerDashboard />;
      
      case 'resource-optimization-config':
        return <ResourceOptimizationConfig />;
      
      case 'performance-optimization-demo':
        return <PerformanceOptimizationDemo />;
      
      case 'auto-resource-optimization-overview':
        return <AutoResourceOptimizationOverview />;
      
      case 'ml-prediction-models':
        return <ReadingPreferencePrediction />;
      
      case 'ml-model-training':
        return <AdvancedMLModelTraining />;
      
      case 'predictive-behavior':
        return <PredictiveBehaviorEngine />;
      
      case 'neural-network-trainer':
        return <NeuralNetworkTrainer />;
      
      case 'transformer-training-studio':
        return <TransformerTrainingStudio />;
      
      case 'deep-learning-pipeline':
        return <DeepLearningPipelineManager />;
      
      case 'arabic-content-classifier':
        return <ArabicContentClassifier />;
      
      case 'neural-network-demo':
        return <ArabicNeuralNetworkDemo />;
      
      case 'arabic-sentiment-analyzer':
        return <ArabicSentimentAnalyzer />;
      
      case 'sentiment-dashboard':
        return <SentimentDashboard articles={articles} />;
      
      case 'auto-sentiment-moderation':
        return <AutoSentimentModeration articles={articles} />;
      
      case 'smart-recommendations':
        return memberUser ? (
          <SmartRecommendationDashboard
            userId={memberUser.id}
            articles={articles}
            onArticleSelect={handleEditArticle}
          />
        ) : (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold">التوصيات الذكية</h2>
            <p className="text-muted-foreground mt-2">يرجى تسجيل الدخول للحصول على توصيات شخصية</p>
            <Button className="mt-4" onClick={() => setShowAuthModal(true)}>
              تسجيل الدخول
            </Button>
          </div>
        );
      
      default:
        return <RoleBasedDashboard onNavigate={handleViewChange} />;
    }
  };

  return (
    <div className={cn("min-h-screen bg-background no-zoom app-container admin-interface no-transform no-zoom-animations", isRTL && "rtl")} dir={isRTL ? "rtl" : "ltr"}>
      {/* Smart Theme Applicator - runs in background */}
      <SmartThemeApplicator 
        userId={user?.id}
        userProfile={memberUser || undefined}
        currentContext={activeView === 'articles' || activeView === 'editor' ? 'editing' : 
                       activeView === 'deep-analysis' ? 'analysis' :
                       activeView.includes('analytics') ? 'dashboard' : 'reading'}
        enableAdaptiveLearning={true}
      />
      
      <div className="flex h-screen main-layout no-transform">
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
            memberUser={memberUser}
            onShowMemberLogin={() => setShowAuthModal(true)}
            onShowMemberProfile={() => setActiveView('member-profile')}
            onMemberLogout={handleMemberLogout}
          />
          
          {/* Public View Toggle - Better positioned */}
          <div className="border-b border-border px-6 py-2 bg-muted/30">
            <div className={cn("flex", isRTL ? "justify-start" : "justify-end")}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsPublicView(true)}
                className={cn("gap-2 h-8 text-xs stable-hover", isRTL && "flex-row-reverse")}
              >
                <Globe className="w-3 h-3" />
                <span className="hidden sm:inline">عرض الموقع العام</span>
                <span className="sm:hidden">عام</span>
              </Button>
            </div>
          </div>
          
          <main className="flex-1 overflow-y-auto p-6 bg-background content-area admin-content">
            {renderContent()}
          </main>
        </div>
      </div>
      
      {/* Notification Center */}
      <NotificationCenter />
      
      {/* Membership Authentication Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            {authMode === 'login' ? (
              <LoginForm
                onLogin={handleMemberLogin}
                onSwitchToRegister={() => setAuthMode('register')}
                onForgotPassword={() => {
                  toast.info('سيتم إضافة استرداد كلمة المرور قريباً');
                }}
              />
            ) : (
              <RegisterForm
                onRegister={handleMemberRegister}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </div>
          
          {/* Close button */}
          <button
            onClick={() => setShowAuthModal(false)}
            className={cn(
              "absolute top-4 text-white hover:text-gray-300 stable-hover",
              isRTL ? "left-4" : "right-4"
            )}
          >
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <RuntimeErrorBoundary
      onError={(error, errorInfo) => {
        console.error('App-level runtime error:', error, errorInfo);
        // Could send to error reporting service here
      }}
    >
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
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
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </RuntimeErrorBoundary>
  );
}

export default App;