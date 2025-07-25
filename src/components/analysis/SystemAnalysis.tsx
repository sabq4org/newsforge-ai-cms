import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Code,
  Database,
  Brain,
  Users,
  ChartBarHorizontal,
  Settings,
  Zap,
  Upload,
  Eye,
  Edit
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { cn } from '@/lib/utils';

interface ComponentAnalysis {
  name: string;
  purpose: string;
  status: 'Fully Functional' | 'In Progress' | 'UI Only' | 'Missing';
  category: 'Editorial Tools' | 'AI Features' | 'User Experience' | 'Analytics' | 'Admin' | 'Performance' | 'Media Management' | 'Collaboration';
  files: string[];
  dependencies: string[];
  features: string[];
  issues?: string[];
  priority: 'High' | 'Medium' | 'Low';
}

export function SystemAnalysis() {
  const { language } = useAuth();
  const typography = useOptimizedTypography();
  const { isRTL, isArabic } = typography;
  
  const [components] = useState<ComponentAnalysis[]>([
    // Editorial Tools
    {
      name: 'Article Editor',
      purpose: 'Rich text editing with collaborative features and media integration',
      status: 'Fully Functional',
      category: 'Editorial Tools',
      files: [
        'components/editor/ArticleEditor.tsx',
        'components/collaborative/CollaborativeTextEditor.tsx',
        'components/collaborative/CollaborativeWorkspace.tsx'
      ],
      dependencies: ['MediaPicker', 'MediaGallery', 'AIOptimization'],
      features: [
        'Rich text editing',
        'Auto-save functionality',
        'Featured image integration',
        'Gallery management',
        'Collaborative editing',
        'AI optimization integration'
      ],
      priority: 'High'
    },
    {
      name: 'Article List Management',
      purpose: 'Browse, filter, and manage articles with advanced search',
      status: 'Fully Functional',
      category: 'Editorial Tools',
      files: ['components/articles/ArticleList.tsx'],
      dependencies: ['Article types', 'Authentication'],
      features: [
        'Article listing',
        'Status filtering',
        'Search functionality',
        'Category badges',
        'Quick actions'
      ],
      priority: 'High'
    },
    {
      name: 'Category Management',
      purpose: 'Organize articles into hierarchical categories',
      status: 'UI Only',
      category: 'Editorial Tools',
      files: [],
      dependencies: ['Admin permissions'],
      features: ['Hierarchical categories', 'Color coding', 'Multilingual support'],
      issues: ['Full CRUD operations needed', 'Category tree view missing'],
      priority: 'High'
    },
    {
      name: 'Tag Management',
      purpose: 'Flexible tagging system for content organization',
      status: 'UI Only',
      category: 'Editorial Tools',
      files: [],
      dependencies: ['Admin permissions'],
      features: ['Tag creation', 'Tag suggestions', 'Tag analytics'],
      issues: ['Tag management interface missing', 'Auto-suggestion not implemented'],
      priority: 'Medium'
    },
    
    // Media Management
    {
      name: 'Media Upload System',
      purpose: 'Advanced file upload with image optimization and metadata management',
      status: 'Fully Functional',
      category: 'Media Management',
      files: [
        'components/media/MediaUpload.tsx',
        'components/media/MediaPicker.tsx',
        'components/media/MediaGallery.tsx',
        'lib/mediaService.ts'
      ],
      dependencies: ['File system', 'Image processing'],
      features: [
        'Drag & drop upload',
        'Image optimization',
        'Metadata extraction',
        'Thumbnail generation',
        'Multiple file formats',
        'Arabic/English captions',
        'Gallery management',
        'Media picker integration'
      ],
      priority: 'High'
    },
    {
      name: 'Media Library',
      purpose: 'Centralized media asset management with search and organization',
      status: 'Fully Functional',
      category: 'Media Management',
      files: ['components/media/MediaUpload.tsx'],
      dependencies: ['MediaService', 'Authentication'],
      features: [
        'Grid/list view toggle',
        'Advanced filtering',
        'Search functionality',
        'Bulk operations',
        'Usage tracking'
      ],
      priority: 'High'
    },
    
    // AI Features
    {
      name: 'AI Optimization Engine',
      purpose: 'AI-powered content optimization and improvement suggestions',
      status: 'Fully Functional',
      category: 'AI Features',
      files: [
        'components/optimization/AIOptimizationEngine.tsx',
        'lib/aiOptimizationService.ts',
        'lib/sabqAIService.ts'
      ],
      dependencies: ['OpenAI API', 'Content analysis'],
      features: [
        'Content analysis',
        'Optimization suggestions',
        'Tone adjustment',
        'SEO improvements',
        'Title generation'
      ],
      priority: 'High'
    },
    {
      name: 'A/B Testing Framework',
      purpose: 'Test different versions of content for optimal performance',
      status: 'Fully Functional',
      category: 'AI Features',
      files: ['components/optimization/ABTestingFramework.tsx'],
      dependencies: ['Analytics tracking'],
      features: [
        'Variant creation',
        'Performance tracking',
        'Statistical significance',
        'Automatic winner selection'
      ],
      priority: 'High'
    },
    {
      name: 'Predictive Analytics',
      purpose: 'Forecast article performance using machine learning',
      status: 'Fully Functional',
      category: 'AI Features',
      files: ['components/optimization/PredictiveAnalytics.tsx'],
      dependencies: ['Historical data', 'ML models'],
      features: [
        'Performance prediction',
        'Optimal timing suggestions',
        'Reach score calculation',
        'Trend analysis'
      ],
      priority: 'High'
    },
    
    // Analytics
    {
      name: 'Advanced Analytics Dashboard',
      purpose: 'Comprehensive analytics with real-time insights',
      status: 'Fully Functional',
      category: 'Analytics',
      files: [
        'components/analytics/AdvancedAnalytics.tsx',
        'components/analytics/RealTimeAnalytics.tsx',
        'components/analytics/PerformanceInsights.tsx'
      ],
      dependencies: ['Chart libraries', 'Analytics data'],
      features: [
        'Real-time metrics',
        'Performance insights',
        'Custom date ranges',
        'Export functionality',
        'Behavioral analysis'
      ],
      priority: 'High'
    },
    {
      name: 'Role-Based Dashboard',
      purpose: 'Personalized dashboards based on user roles and permissions',
      status: 'Fully Functional',
      category: 'Analytics',
      files: ['components/dashboard/RoleBasedDashboard.tsx'],
      dependencies: ['Authentication', 'Role system'],
      features: [
        'Role-specific views',
        'Personal statistics',
        'Recent activity',
        'Quick actions',
        'Performance metrics'
      ],
      priority: 'High'
    },
    
    // User Experience
    {
      name: 'Authentication System',
      purpose: 'Secure user authentication with role-based access control',
      status: 'Fully Functional',
      category: 'User Experience',
      files: [
        'contexts/AuthContext.tsx',
        'components/auth/LoginForm.tsx'
      ],
      dependencies: ['Permission system'],
      features: [
        'Role-based access',
        'Permission checking',
        'Session management',
        'Multi-language support'
      ],
      priority: 'High'
    },
    {
      name: 'Typography System',
      purpose: 'Advanced typography controls with Arabic support',
      status: 'Fully Functional',
      category: 'User Experience',
      files: [
        'contexts/TypographyContext.tsx',
        'components/settings/TypographySettings.tsx',
        'hooks/useOptimizedTypography.ts'
      ],
      dependencies: ['Font loading', 'CSS variables'],
      features: [
        'IBM Plex Sans Arabic integration',
        'Dynamic font scaling',
        'Line height control',
        'Letter spacing adjustment',
        'RTL support'
      ],
      priority: 'Medium'
    },
    {
      name: 'Responsive Layout',
      purpose: 'Mobile-first responsive design with RTL support',
      status: 'Fully Functional',
      category: 'User Experience',
      files: [
        'components/layout/Header.tsx',
        'components/layout/Sidebar.tsx'
      ],
      dependencies: ['Tailwind CSS'],
      features: [
        'Mobile navigation',
        'RTL layout',
        'Responsive grids',
        'Touch-friendly interactions'
      ],
      priority: 'High'
    },
    
    // Collaboration
    {
      name: 'Real-time Collaborative Editing',
      purpose: 'Multiple journalists working on the same article simultaneously',
      status: 'In Progress',
      category: 'Collaboration',
      files: [
        'contexts/CollaborativeContext.tsx',
        'components/collaborative/CollaborativePresence.tsx',
        'components/collaborative/ConflictResolutionPanel.tsx'
      ],
      dependencies: ['WebSocket connection', 'Conflict resolution'],
      features: [
        'Live cursor tracking',
        'User presence indicators',
        'Conflict resolution',
        'Change history',
        'Comment system'
      ],
      issues: ['WebSocket backend needed', 'Operational transformation missing'],
      priority: 'High'
    },
    
    // Admin
    {
      name: 'User Management',
      purpose: 'Manage users, roles, and permissions',
      status: 'UI Only',
      category: 'Admin',
      files: [],
      dependencies: ['Admin permissions', 'User CRUD'],
      features: ['User creation', 'Role assignment', 'Permission management'],
      issues: ['Full user management interface missing'],
      priority: 'Medium'
    },
    {
      name: 'Content Moderation',
      purpose: 'AI-powered content moderation and editorial workflow',
      status: 'UI Only',
      category: 'Admin',
      files: [],
      dependencies: ['AI moderation', 'Workflow engine'],
      features: ['Automated flagging', 'Manual review queue', 'Approval workflows'],
      issues: ['Moderation algorithms needed', 'Workflow engine missing'],
      priority: 'Medium'
    },
    
    // Performance
    {
      name: 'Caching System',
      purpose: 'Efficient data caching and state management',
      status: 'In Progress',
      category: 'Performance',
      files: ['hooks/useKV.ts'],
      dependencies: ['Browser storage', 'State persistence'],
      features: [
        'Local storage integration',
        'State persistence',
        'Cache invalidation'
      ],
      issues: ['Redis/CDN integration needed for production'],
      priority: 'Medium'
    },
    {
      name: 'SEO Optimization',
      purpose: 'Search engine optimization and social media integration',
      status: 'Missing',
      category: 'Performance',
      files: [],
      dependencies: ['Meta tag management', 'Sitemap generation'],
      features: ['Meta tags', 'Open Graph', 'Schema markup', 'Sitemap'],
      issues: ['SEO components not implemented'],
      priority: 'Medium'
    }
  ]);

  const getStatusColor = (status: ComponentAnalysis['status']) => {
    switch (status) {
      case 'Fully Functional': return 'text-green-600 bg-green-50 border-green-200';
      case 'In Progress': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'UI Only': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Missing': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = (status: ComponentAnalysis['status']) => {
    switch (status) {
      case 'Fully Functional': return <CheckCircle className="w-4 h-4" />;
      case 'In Progress': return <Clock className="w-4 h-4" />;
      case 'UI Only': return <Eye className="w-4 h-4" />;
      case 'Missing': return <XCircle className="w-4 h-4" />;
    }
  };

  const getCategoryIcon = (category: ComponentAnalysis['category']) => {
    switch (category) {
      case 'Editorial Tools': return <Edit className="w-5 h-5" />;
      case 'AI Features': return <Brain className="w-5 h-5" />;
      case 'User Experience': return <Users className="w-5 h-5" />;
      case 'Analytics': return <ChartBarHorizontal className="w-5 h-5" />;
      case 'Admin': return <Settings className="w-5 h-5" />;
      case 'Performance': return <Zap className="w-5 h-5" />;
      case 'Media Management': return <Upload className="w-5 h-5" />;
      case 'Collaboration': return <Users className="w-5 h-5" />;
    }
  };

  const categories = Array.from(new Set(components.map(c => c.category)));
  const statusCounts = components.reduce((acc, comp) => {
    acc[comp.status] = (acc[comp.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalComponents = components.length;
  const fullyFunctional = statusCounts['Fully Functional'] || 0;
  const completionPercentage = Math.round((fullyFunctional / totalComponents) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          {isArabic ? 'تحليل نظام سبق الذكية' : 'Sabq AI CMS System Analysis'}
        </h1>
        <p className="text-muted-foreground mt-2">
          {isArabic 
            ? 'تحليل شامل لجميع المكونات والوحدات والخدمات في النظام'
            : 'Comprehensive breakdown of all components, modules, and services in the system'
          }
        </p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'إجمالي المكونات' : 'Total Components'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalComponents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'مكتملة الوظائف' : 'Fully Functional'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{fullyFunctional}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'نسبة الإكمال' : 'Completion Rate'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionPercentage}%</div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isArabic ? 'الفئات' : 'Categories'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>{isArabic ? 'نظرة عامة على الحالة' : 'Status Overview'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status} className="text-center">
                <div className={cn('inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm', getStatusColor(status as any))}>
                  {getStatusIcon(status as any)}
                  {status}
                </div>
                <div className="text-2xl font-bold mt-2">{count}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Component Analysis by Category */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList className="grid grid-cols-3 lg:grid-cols-5 w-full">
          <TabsTrigger value="all">{isArabic ? 'الكل' : 'All'}</TabsTrigger>
          <TabsTrigger value="issues">{isArabic ? 'المشاكل' : 'Issues'}</TabsTrigger>
          <TabsTrigger value="missing">{isArabic ? 'مفقود' : 'Missing'}</TabsTrigger>
          <TabsTrigger value="priority">{isArabic ? 'أولوية عالية' : 'High Priority'}</TabsTrigger>
          <TabsTrigger value="categories">{isArabic ? 'الفئات' : 'Categories'}</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4">
              {components.map((component, index) => (
                <ComponentCard key={index} component={component} isArabic={isArabic} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4">
              {components.filter(c => c.issues).map((component, index) => (
                <ComponentCard key={index} component={component} isArabic={isArabic} showIssues />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="missing" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4">
              {components.filter(c => c.status === 'Missing' || c.status === 'UI Only').map((component, index) => (
                <ComponentCard key={index} component={component} isArabic={isArabic} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="priority" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="grid gap-4">
              {components.filter(c => c.priority === 'High').map((component, index) => (
                <ComponentCard key={index} component={component} isArabic={isArabic} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          {categories.map(category => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category}
                  <Badge variant="outline">
                    {components.filter(c => c.category === category).length} {isArabic ? 'مكونات' : 'components'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3">
                  {components.filter(c => c.category === category).map((component, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={cn('flex items-center gap-1 px-2 py-1 rounded text-xs', getStatusColor(component.status))}>
                          {getStatusIcon(component.status)}
                          {component.status}
                        </div>
                        <div>
                          <h4 className="font-medium">{component.name}</h4>
                          <p className="text-sm text-muted-foreground">{component.purpose}</p>
                        </div>
                      </div>
                      <Badge variant={component.priority === 'High' ? 'destructive' : component.priority === 'Medium' ? 'default' : 'secondary'}>
                        {component.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Critical Gaps Summary */}
      <Alert>
        <AlertTriangle className="w-4 h-4" />
        <AlertDescription>
          <strong>{isArabic ? 'الثغرات الحرجة:' : 'Critical Gaps:'}</strong>
          {' '}
          {isArabic 
            ? 'إدارة المستخدمين، مراجعة المحتوى، تحسين محرك البحث، وإنتاج WebSocket للتعاون المباشر تحتاج إلى تطوير كامل.'
            : 'User Management, Content Moderation, SEO Optimization, and WebSocket backend for real-time collaboration need full development.'
          }
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Component Card Component
interface ComponentCardProps {
  component: ComponentAnalysis;
  isArabic: boolean;
  showIssues?: boolean;
}

function ComponentCard({ component, isArabic, showIssues = false }: ComponentCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="mt-1">
              {getCategoryIcon(component.category)}
            </div>
            <div>
              <CardTitle className="text-lg">{component.name}</CardTitle>
              <CardDescription className="mt-1">{component.purpose}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={component.priority === 'High' ? 'destructive' : component.priority === 'Medium' ? 'default' : 'secondary'}>
              {component.priority}
            </Badge>
            <div className={cn('flex items-center gap-1 px-2 py-1 rounded text-xs', getStatusColor(component.status))}>
              {getStatusIcon(component.status)}
              {component.status}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Features */}
        <div>
          <h4 className="font-medium mb-2">{isArabic ? 'الميزات' : 'Features'}</h4>
          <div className="flex flex-wrap gap-1">
            {component.features.map((feature, idx) => (
              <Badge key={idx} variant="outline" className="text-xs">{feature}</Badge>
            ))}
          </div>
        </div>

        {/* Files */}
        {component.files.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">{isArabic ? 'الملفات' : 'Files'}</h4>
            <div className="space-y-1">
              {component.files.map((file, idx) => (
                <code key={idx} className="text-xs bg-muted px-2 py-1 rounded block">{file}</code>
              ))}
            </div>
          </div>
        )}

        {/* Dependencies */}
        {component.dependencies.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">{isArabic ? 'التبعيات' : 'Dependencies'}</h4>
            <div className="flex flex-wrap gap-1">
              {component.dependencies.map((dep, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">{dep}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Issues */}
        {(component.issues || showIssues) && component.issues && (
          <div>
            <h4 className="font-medium mb-2 text-red-600">{isArabic ? 'المشاكل' : 'Issues'}</h4>
            <ul className="space-y-1">
              {component.issues.map((issue, idx) => (
                <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                  <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );

  function getCategoryIcon(category: ComponentAnalysis['category']) {
    switch (category) {
      case 'Editorial Tools': return <Edit className="w-5 h-5" />;
      case 'AI Features': return <Brain className="w-5 h-5" />;
      case 'User Experience': return <Users className="w-5 h-5" />;
      case 'Analytics': return <ChartBarHorizontal className="w-5 h-5" />;
      case 'Admin': return <Settings className="w-5 h-5" />;
      case 'Performance': return <Zap className="w-5 h-5" />;
      case 'Media Management': return <Upload className="w-5 h-5" />;
      case 'Collaboration': return <Users className="w-5 h-5" />;
    }
  }

  function getStatusColor(status: ComponentAnalysis['status']) {
    switch (status) {
      case 'Fully Functional': return 'text-green-600 bg-green-50 border-green-200';
      case 'In Progress': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'UI Only': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'Missing': return 'text-red-600 bg-red-50 border-red-200';
    }
  }

  function getStatusIcon(status: ComponentAnalysis['status']) {
    switch (status) {
      case 'Fully Functional': return <CheckCircle className="w-4 h-4" />;
      case 'In Progress': return <Clock className="w-4 h-4" />;
      case 'UI Only': return <Eye className="w-4 h-4" />;
      case 'Missing': return <XCircle className="w-4 h-4" />;
    }
  }
}