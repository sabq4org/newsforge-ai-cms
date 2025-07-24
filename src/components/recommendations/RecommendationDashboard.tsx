import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  BarChart3, 
  Users, 
  Star,
  TrendingUp,
  Sparkles,
  Eye,
  Heart,
  ThumbsUp,
  Target,
  Zap,
  MessageCircle,
  Trophy,
  Calendar,
  TrendUp
} from '@phosphor-icons/react';
import { PersonalizedRecommendations } from './PersonalizedRecommendations';
import { RecommendationEvaluation } from './RecommendationEvaluation';
import { RecommendationInsights } from './RecommendationInsights';
import { AIRecommendationEngine } from './AIRecommendationEngine';
import { useAuth } from '@/contexts/AuthContext';
import { useKV } from '@github/spark/hooks';
import { Article, User } from '@/types';
import { mockArticles } from '@/lib/mockData';

interface RecommendationDashboardProps {
  onNavigate?: (view: string) => void;
  onArticleSelect?: (article: Article) => void;
}

export function RecommendationDashboard({ onNavigate, onArticleSelect }: RecommendationDashboardProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedArticle, setSelectedArticle] = useState<Article | undefined>();

  // Mock analytics data - in real implementation would come from API
  const analyticsData = {
    totalRecommendations: 15420,
    clickThroughRate: 18.5,
    averageRating: 4.2,
    userSatisfaction: 85,
    weeklyGrowth: 12.3,
    topPerformingCategory: 'تقنية',
    activeFeedbacks: 1284,
    improvementActions: 8
  };

  const handleArticleSelect = (article: Article) => {
    setSelectedArticle(article);
    onArticleSelect?.(article);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.totalRecommendations.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">إجمالي التوصيات</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Target size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.clickThroughRate}%</p>
                <p className="text-xs text-muted-foreground">معدل النقر</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Star size={20} className="text-yellow-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.averageRating}</p>
                <p className="text-xs text-muted-foreground">متوسط التقييم</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <ThumbsUp size={20} className="text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analyticsData.userSatisfaction}%</p>
                <p className="text-xs text-muted-foreground">رضا المستخدمين</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap size={20} />
            إجراءات سريعة
          </CardTitle>
          <CardDescription>
            أدوات وميزات نظام التوصيات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setActiveTab('personalized')}
            >
              <Sparkles size={24} />
              <div className="text-center">
                <p className="font-medium">التوصيات المخصصة</p>
                <p className="text-xs text-muted-foreground">استكشف التوصيات الذكية</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setActiveTab('evaluation')}
            >
              <MessageCircle size={24} />
              <div className="text-center">
                <p className="font-medium">تقييم التوصيات</p>
                <p className="text-xs text-muted-foreground">قيّم جودة التوصيات</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setActiveTab('insights')}
            >
              <BarChart3 size={24} />
              <div className="text-center">
                <p className="font-medium">رؤى وتحليلات</p>
                <p className="text-xs text-muted-foreground">تحليلات متقدمة للأداء</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp size={20} />
              أداء هذا الأسبوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">نمو التوصيات</span>
                <Badge variant="secondary" className="bg-green-50 text-green-700">
                  +{analyticsData.weeklyGrowth}%
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">أفضل قسم أداءً</span>
                <Badge variant="outline">{analyticsData.topPerformingCategory}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">تقييمات جديدة</span>
                <span className="text-sm font-medium">{analyticsData.activeFeedbacks}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">إجراءات التحسين</span>
                <Badge variant="destructive" className="bg-orange-50 text-orange-700">
                  {analyticsData.improvementActions} معلق
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy size={20} />
              إنجازات النظام
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 border rounded-lg">
                <div className="p-1.5 bg-yellow-100 rounded">
                  <Star size={16} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">تقييم ممتاز</p>
                  <p className="text-xs text-muted-foreground">حصل على 4+ نجوم</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 border rounded-lg">
                <div className="p-1.5 bg-green-100 rounded">
                  <TrendingUp size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">نمو متسارع</p>
                  <p className="text-xs text-muted-foreground">نمو 12%+ هذا الأسبوع</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-2 border rounded-lg">
                <div className="p-1.5 bg-blue-100 rounded">
                  <Users size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">تفاعل عالي</p>
                  <p className="text-xs text-muted-foreground">85%+ رضا المستخدمين</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar size={20} />
            النشاط الأخير
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { action: 'تم تحديث خوارزمية التوصية للمحتوى التقني', time: 'منذ ساعتين', type: 'system' },
              { action: 'وصل 25 تقييم جديد من المستخدمين', time: 'منذ 4 ساعات', type: 'feedback' },
              { action: 'تم تحسين توصيات الفترة المسائية', time: 'منذ 6 ساعات', type: 'optimization' },
              { action: 'تم اكتشاف فجوة في المحتوى الاقتصادي', time: 'أمس', type: 'insight' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center gap-3 p-2 border-l-2 border-l-primary/20">
                <div className={`p-1.5 rounded ${
                  activity.type === 'system' ? 'bg-blue-100' :
                  activity.type === 'feedback' ? 'bg-green-100' :
                  activity.type === 'optimization' ? 'bg-yellow-100' :
                  'bg-purple-100'
                }`}>
                  {activity.type === 'system' && <Brain size={14} className="text-blue-600" />}
                  {activity.type === 'feedback' && <MessageCircle size={14} className="text-green-600" />}
                  {activity.type === 'optimization' && <Zap size={14} className="text-yellow-600" />}
                  {activity.type === 'insight' && <Eye size={14} className="text-purple-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم التوصيات</h1>
          <p className="text-muted-foreground mt-1">
            نظام التوصيات المدعوم بالذكاء الاصطناعي - مركز التحكم والتحليل
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="bg-green-50 text-green-700">
            نشط
          </Badge>
          <Badge variant="outline">
            الإصدار 2.1
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 size={16} />
            نظرة عامة
          </TabsTrigger>
          <TabsTrigger value="personalized" className="flex items-center gap-2">
            <Sparkles size={16} />
            التوصيات
          </TabsTrigger>
          <TabsTrigger value="ai-engine" className="flex items-center gap-2">
            <Brain size={16} />
            المحرك الذكي
          </TabsTrigger>
          <TabsTrigger value="evaluation" className="flex items-center gap-2">
            <MessageCircle size={16} />
            التقييم
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendUp size={16} />
            الرؤى
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="personalized" className="space-y-6">
          <PersonalizedRecommendations
            currentUser={user}
            articles={mockArticles}
            onArticleSelect={handleArticleSelect}
          />
        </TabsContent>

        <TabsContent value="ai-engine" className="space-y-6">
          <AIRecommendationEngine
            currentArticleId={selectedArticle?.id}
            userId={user?.id}
            onArticleSelect={handleArticleSelect}
          />
        </TabsContent>

        <TabsContent value="evaluation" className="space-y-6">
          <RecommendationEvaluation
            articleId={selectedArticle?.id}
            onFeedbackSubmitted={(feedback) => {
              console.log('Feedback submitted:', feedback);
            }}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <RecommendationInsights
            onInsightAction={(insight, action) => {
              console.log('Insight action:', insight, action);
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}