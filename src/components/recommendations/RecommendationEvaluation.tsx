import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  ThumbsUp, 
  ThumbsDown, 
  Star, 
  MessageCircle, 
  TrendingUp, 
  Target, 
  Clock, 
  Brain,
  BarChart3,
  Users,
  Lightbulb,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Heart,
  Share2,
  BookOpen,
  Sparkles,
  ChartLine,
  Filter,
  Calendar,
  Award
} from '@phosphor-icons/react';
import { useAuth } from '@/contexts/AuthContext';
import { useKV } from '@github/spark/hooks';
import { Article, User } from '@/types';
import { toast } from 'sonner';

interface RecommendationFeedback {
  id: string;
  userId: string;
  articleId: string;
  recommendationId: string;
  rating: number; // 1-5 stars
  helpful: boolean | null; // true = helpful, false = not helpful, null = not rated
  feedback: string;
  reasons: string[]; // why they liked/disliked
  timestamp: Date;
  context: {
    recommendationScore: number;
    factors: any;
    timeOfDay: string;
    userSession: string;
  };
}

interface RecommendationAnalytics {
  totalEvaluations: number;
  averageRating: number;
  helpfulnessRate: number;
  categoryPerformance: Record<string, {
    avgRating: number;
    totalFeedbacks: number;
    helpfulnessRate: number;
  }>;
  timeSlotPerformance: Record<string, {
    avgRating: number;
    totalFeedbacks: number;
  }>;
  commonFeedback: {
    positive: string[];
    negative: string[];
  };
  improvementSuggestions: string[];
}

interface RecommendationEvaluationProps {
  articleId?: string;
  recommendationId?: string;
  onFeedbackSubmitted?: (feedback: RecommendationFeedback) => void;
  showAnalytics?: boolean;
}

export function RecommendationEvaluation({ 
  articleId, 
  recommendationId,
  onFeedbackSubmitted,
  showAnalytics = true 
}: RecommendationEvaluationProps) {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useKV<RecommendationFeedback[]>('recommendation-feedbacks', []);
  const [currentFeedback, setCurrentFeedback] = useState<Partial<RecommendationFeedback>>({});
  const [activeTab, setActiveTab] = useState('evaluate');
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate analytics from feedback data
  const calculateAnalytics = (): RecommendationAnalytics => {
    const now = new Date();
    const timeframeDays = selectedTimeframe === 'day' ? 1 : selectedTimeframe === 'week' ? 7 : selectedTimeframe === 'month' ? 30 : 90;
    const cutoffDate = new Date(now.getTime() - timeframeDays * 24 * 60 * 60 * 1000);
    
    const relevantFeedbacks = feedbacks.filter(f => new Date(f.timestamp) >= cutoffDate);
    
    if (relevantFeedbacks.length === 0) {
      return {
        totalEvaluations: 0,
        averageRating: 0,
        helpfulnessRate: 0,
        categoryPerformance: {},
        timeSlotPerformance: {},
        commonFeedback: { positive: [], negative: [] },
        improvementSuggestions: []
      };
    }

    const totalEvaluations = relevantFeedbacks.length;
    const averageRating = relevantFeedbacks.reduce((sum, f) => sum + f.rating, 0) / totalEvaluations;
    const helpfulVotes = relevantFeedbacks.filter(f => f.helpful === true).length;
    const helpfulnessRate = helpfulVotes / relevantFeedbacks.filter(f => f.helpful !== null).length || 0;

    // Category performance analysis
    const categoryGroups = relevantFeedbacks.reduce((acc, f) => {
      const category = 'محليات'; // Would get from article data in real implementation
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(f);
      return acc;
    }, {} as Record<string, RecommendationFeedback[]>);

    const categoryPerformance = Object.entries(categoryGroups).reduce((acc, [category, feedbacks]) => {
      acc[category] = {
        avgRating: feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length,
        totalFeedbacks: feedbacks.length,
        helpfulnessRate: feedbacks.filter(f => f.helpful === true).length / feedbacks.filter(f => f.helpful !== null).length || 0
      };
      return acc;
    }, {} as Record<string, any>);

    // Time slot performance
    const timeSlotGroups = relevantFeedbacks.reduce((acc, f) => {
      const timeSlot = f.context.timeOfDay || 'unknown';
      if (!acc[timeSlot]) {
        acc[timeSlot] = [];
      }
      acc[timeSlot].push(f);
      return acc;
    }, {} as Record<string, RecommendationFeedback[]>);

    const timeSlotPerformance = Object.entries(timeSlotGroups).reduce((acc, [slot, feedbacks]) => {
      acc[slot] = {
        avgRating: feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length,
        totalFeedbacks: feedbacks.length
      };
      return acc;
    }, {} as Record<string, any>);

    // Common feedback analysis
    const positiveFeedbacks = relevantFeedbacks.filter(f => f.rating >= 4).map(f => f.feedback).filter(Boolean);
    const negativeFeedbacks = relevantFeedbacks.filter(f => f.rating <= 2).map(f => f.feedback).filter(Boolean);

    // Generate improvement suggestions based on feedback patterns
    const improvementSuggestions = [];
    if (averageRating < 3.5) {
      improvementSuggestions.push('تحسين دقة خوارزمية التوصية');
    }
    if (helpfulnessRate < 0.7) {
      improvementSuggestions.push('تحسين ملاءمة التوصيات للمحتوى');
    }
    
    const lowPerformingCategories = Object.entries(categoryPerformance)
      .filter(([_, perf]) => perf.avgRating < 3)
      .map(([category, _]) => category);
    
    if (lowPerformingCategories.length > 0) {
      improvementSuggestions.push(`تحسين توصيات أقسام: ${lowPerformingCategories.join('، ')}`);
    }

    return {
      totalEvaluations,
      averageRating,
      helpfulnessRate,
      categoryPerformance,
      timeSlotPerformance,
      commonFeedback: {
        positive: positiveFeedbacks.slice(0, 5),
        negative: negativeFeedbacks.slice(0, 5)
      },
      improvementSuggestions
    };
  };

  const analytics = calculateAnalytics();

  // Submit feedback
  const handleSubmitFeedback = async () => {
    if (!user || !currentFeedback.rating) {
      toast.error('يرجى تقييم التوصية أولاً');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const feedback: RecommendationFeedback = {
        id: `feedback_${Date.now()}`,
        userId: user.id,
        articleId: articleId || 'unknown',
        recommendationId: recommendationId || 'unknown',
        rating: currentFeedback.rating,
        helpful: currentFeedback.helpful || null,
        feedback: currentFeedback.feedback || '',
        reasons: currentFeedback.reasons || [],
        timestamp: new Date(),
        context: {
          recommendationScore: 85, // Would come from actual recommendation
          factors: {},
          timeOfDay: getTimeOfDay(),
          userSession: `session_${Date.now()}`
        }
      };

      setFeedbacks(current => [...current, feedback]);
      
      // Reset form
      setCurrentFeedback({});
      
      toast.success('شكراً لك! تم إرسال تقييمك وسيساعدنا في تحسين التوصيات');
      
      onFeedbackSubmitted?.(feedback);
      
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast.error('حدث خطأ في إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTimeOfDay = (): string => {
    const hour = new Date().getHours();
    if (hour < 6) return 'فجر';
    if (hour < 12) return 'صباح';
    if (hour < 16) return 'ظهر';
    if (hour < 20) return 'مساء';
    return 'ليل';
  };

  const renderStarRating = (rating: number, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange?.(star)}
            className={`p-1 transition-colors ${
              star <= rating 
                ? 'text-yellow-500 hover:text-yellow-600' 
                : 'text-gray-300 hover:text-gray-400'
            }`}
            disabled={!onRatingChange}
          >
            <Star 
              size={20} 
              weight={star <= rating ? 'fill' : 'regular'} 
            />
          </button>
        ))}
      </div>
    );
  };

  const renderFeedbackForm = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle size={20} />
          تقييم التوصية
        </CardTitle>
        <CardDescription>
          ساعدنا في تحسين نظام التوصيات من خلال تقييمك
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Star Rating */}
        <div className="space-y-2">
          <Label>تقييم عام للتوصية</Label>
          <div className="flex items-center gap-3">
            {renderStarRating(currentFeedback.rating || 0, (rating) => 
              setCurrentFeedback(prev => ({ ...prev, rating }))
            )}
            <span className="text-sm text-muted-foreground">
              {currentFeedback.rating ? `${currentFeedback.rating} من 5` : 'لم يتم التقييم'}
            </span>
          </div>
        </div>

        {/* Helpfulness */}
        <div className="space-y-2">
          <Label>هل كانت التوصية مفيدة؟</Label>
          <div className="flex gap-2">
            <Button
              variant={currentFeedback.helpful === true ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentFeedback(prev => ({ ...prev, helpful: true }))}
              className="flex items-center gap-2"
            >
              <ThumbsUp size={14} />
              مفيدة
            </Button>
            <Button
              variant={currentFeedback.helpful === false ? 'destructive' : 'outline'}
              size="sm"
              onClick={() => setCurrentFeedback(prev => ({ ...prev, helpful: false }))}
              className="flex items-center gap-2"
            >
              <ThumbsDown size={14} />
              غير مفيدة
            </Button>
          </div>
        </div>

        {/* Detailed Feedback */}
        <div className="space-y-2">
          <Label>تعليقات إضافية (اختياري)</Label>
          <Textarea
            placeholder="شاركنا رأيك في التوصية وكيف يمكننا تحسينها..."
            value={currentFeedback.feedback || ''}
            onChange={(e) => setCurrentFeedback(prev => ({ ...prev, feedback: e.target.value }))}
            className="min-h-[100px]"
          />
        </div>

        {/* Reasons */}
        <div className="space-y-2">
          <Label>أسباب التقييم</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              'محتوى ملائم لاهتماماتي',
              'توقيت مناسب للقراءة',
              'جودة المحتوى عالية',
              'موضوع جديد ومفيد',
              'طول المقال مناسب',
              'سهولة الفهم',
              'محتوى غير ملائم',
              'توقيت غير مناسب',
              'محتوى مكرر',
              'صعوبة في الفهم'
            ].map(reason => (
              <Button
                key={reason}
                variant={currentFeedback.reasons?.includes(reason) ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  const reasons = currentFeedback.reasons || [];
                  const newReasons = reasons.includes(reason)
                    ? reasons.filter(r => r !== reason)
                    : [...reasons, reason];
                  setCurrentFeedback(prev => ({ ...prev, reasons: newReasons }));
                }}
                className="text-xs h-8"
              >
                {reason}
              </Button>
            ))}
          </div>
        </div>

        <Button 
          onClick={handleSubmitFeedback}
          disabled={!currentFeedback.rating || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              جاري الإرسال...
            </div>
          ) : (
            <>
              <CheckCircle size={16} className="ml-1" />
              إرسال التقييم
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );

  const renderAnalyticsDashboard = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-4">
        <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">اليوم</SelectItem>
            <SelectItem value="week">الأسبوع</SelectItem>
            <SelectItem value="month">الشهر</SelectItem>
            <SelectItem value="quarter">3 أشهر</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MessageCircle size={20} className="text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{analytics.totalEvaluations}</p>
                <p className="text-xs text-muted-foreground">إجمالي التقييمات</p>
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
                <p className="text-2xl font-bold">{analytics.averageRating.toFixed(1)}</p>
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
                <p className="text-2xl font-bold">{Math.round(analytics.helpfulnessRate * 100)}%</p>
                <p className="text-xs text-muted-foreground">معدل الفائدة</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp size={20} className="text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {analytics.averageRating >= 4 ? '+' : analytics.averageRating >= 3 ? '=' : '-'}
                  {Math.abs(analytics.averageRating - 3).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground">اتجاه الأداء</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={20} />
            أداء التوصيات حسب القسم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analytics.categoryPerformance).map(([category, performance]) => (
              <div key={category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{category}</span>
                  <Badge variant="outline" className="text-xs">
                    {performance.totalFeedbacks} تقييم
                  </Badge>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    {renderStarRating(Math.round(performance.avgRating))}
                    <span className="text-sm text-muted-foreground">
                      {performance.avgRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="w-20">
                    <Progress 
                      value={performance.helpfulnessRate * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Time Slot Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock size={20} />
            أداء التوصيات حسب الوقت
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(analytics.timeSlotPerformance).map(([timeSlot, performance]) => (
              <div key={timeSlot} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{timeSlot}</p>
                  <p className="text-sm text-muted-foreground">
                    {performance.totalFeedbacks} تقييم
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStarRating(Math.round(performance.avgRating))}
                  <span className="text-sm">{performance.avgRating.toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Suggestions */}
      {analytics.improvementSuggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb size={20} />
              اقتراحات التحسين
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.improvementSuggestions.map((suggestion, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-amber-50 border border-amber-200 rounded">
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Feedback */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle size={20} />
            آخر التقييمات
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feedbacks.slice(-5).reverse().map(feedback => (
              <div key={feedback.id} className="p-3 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {renderStarRating(feedback.rating)}
                    <Badge variant={feedback.helpful === true ? 'default' : feedback.helpful === false ? 'destructive' : 'secondary'}>
                      {feedback.helpful === true ? 'مفيد' : feedback.helpful === false ? 'غير مفيد' : 'لم يُحدد'}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(feedback.timestamp).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                {feedback.feedback && (
                  <p className="text-sm text-muted-foreground mb-2">{feedback.feedback}</p>
                )}
                {feedback.reasons.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {feedback.reasons.map(reason => (
                      <Badge key={reason} variant="outline" className="text-xs">
                        {reason}
                      </Badge>
                    ))}
                  </div>
                )}
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
          <h1 className="text-3xl font-bold">نظام تقييم التوصيات</h1>
          <p className="text-muted-foreground mt-1">
            تقييم وتحليل أداء نظام التوصيات المدعوم بالذكاء الاصطناعي
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="evaluate" className="flex items-center gap-2">
            <Star size={16} />
            تقييم التوصية
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 size={16} />
            تحليلات الأداء
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evaluate" className="space-y-6">
          {renderFeedbackForm()}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {showAnalytics ? renderAnalyticsDashboard() : (
            <Card className="text-center py-12">
              <CardContent>
                <BarChart3 size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">التحليلات غير متاحة</h3>
                <p className="text-muted-foreground">
                  ليس لديك صلاحية لعرض تحليلات نظام التوصيات
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}