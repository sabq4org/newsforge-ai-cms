import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar,
  Clock,
  Plus,
  Edit,
  Trash,
  TrendingUp,
  Users,
  Bell,
  CheckCircle,
  AlertCircle,
  Zap
} from '@phosphor-icons/react';
import { Article } from '@/types';
import { safeTimeFormat, safeDateFormat } from '@/lib/utils';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface ScheduledPost {
  id: string;
  articleId: string;
  article: Article;
  scheduledFor: Date;
  timeSlot: 'morning' | 'noon' | 'evening' | 'night';
  platform: 'web' | 'social' | 'newsletter' | 'all';
  priority: 'low' | 'normal' | 'high' | 'breaking';
  status: 'scheduled' | 'published' | 'failed' | 'cancelled';
  createdBy: string;
  estimatedReach?: number;
  notes?: string;
}

interface TimeSlotConfig {
  name: string;
  timeRange: string;
  optimalHours: number[];
  expectedReach: number;
  audienceType: string;
}

const TIME_SLOTS: Record<string, TimeSlotConfig> = {
  morning: {
    name: 'الصباح',
    timeRange: '6:00 - 9:00',
    optimalHours: [7, 8],
    expectedReach: 85,
    audienceType: 'عاملون وطلاب'
  },
  noon: {
    name: 'الظهر', 
    timeRange: '12:00 - 14:00',
    optimalHours: [12, 13],
    expectedReach: 65,
    audienceType: 'استراحة العمل'
  },
  evening: {
    name: 'المساء',
    timeRange: '18:00 - 21:00', 
    optimalHours: [19, 20],
    expectedReach: 95,
    audienceType: 'وقت الفراغ'
  },
  night: {
    name: 'الليل',
    timeRange: '22:00 - 24:00',
    optimalHours: [22, 23],
    expectedReach: 45,
    audienceType: 'قراء متأخرون'
  }
};

interface SchedulingCalendarProps {
  articles?: Article[];
  onScheduleCreated?: (schedule: ScheduledPost) => void;
}

export function SchedulingCalendar({ articles = [], onScheduleCreated }: SchedulingCalendarProps) {
  const { user } = useAuth();
  const [scheduledPosts, setScheduledPosts] = useKV<ScheduledPost[]>('sabq-scheduled-posts', []);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [scheduleForm, setScheduleForm] = useState({
    timeSlot: 'morning' as keyof typeof TIME_SLOTS,
    platform: 'web',
    priority: 'normal',
    notes: '',
    customTime: ''
  });

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const currentDate = new Date(startDate);
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Get scheduled posts for a specific date
  const getPostsForDate = (date: Date) => {
    return scheduledPosts.filter(post => {
      const postDate = new Date(post.scheduledFor);
      return postDate.toDateString() === date.toDateString();
    });
  };

  // Calculate optimal scheduling time
  const calculateOptimalTime = async (article: Article, timeSlot: keyof typeof TIME_SLOTS) => {
    try {
      const prompt = spark.llmPrompt`Analyze this Arabic news article for optimal publishing time within ${TIME_SLOTS[timeSlot].name} (${TIME_SLOTS[timeSlot].timeRange}):

Title: ${article.title}
Category: ${article.category?.name}
Content preview: ${article.content.substring(0, 500)}

Consider:
- News urgency and relevance
- Target audience activity patterns
- Category-specific optimal times
- Competition analysis

Return a specific hour (${TIME_SLOTS[timeSlot].optimalHours.join(' or ')}) and expected engagement score (0-100).`;

      const result = await spark.llm(prompt, 'gpt-4o-mini', true);
      const analysis = JSON.parse(result);
      return analysis;
    } catch (error) {
      console.error('Error calculating optimal time:', error);
      return { hour: TIME_SLOTS[timeSlot].optimalHours[0], engagementScore: 70 };
    }
  };

  // Handle scheduling
  const handleScheduleArticle = async () => {
    if (!selectedArticle || !user) return;

    try {
      const timeSlotConfig = TIME_SLOTS[scheduleForm.timeSlot];
      const analysis = await calculateOptimalTime(selectedArticle, scheduleForm.timeSlot);
      
      // Create scheduled time
      const scheduledDate = new Date(selectedDate);
      const hour = scheduleForm.customTime ? 
        parseInt(scheduleForm.customTime.split(':')[0]) : 
        analysis.hour || timeSlotConfig.optimalHours[0];
      const minute = scheduleForm.customTime ? 
        parseInt(scheduleForm.customTime.split(':')[1]) : 0;
      
      scheduledDate.setHours(hour, minute, 0, 0);

      const newSchedule: ScheduledPost = {
        id: `schedule_${Date.now()}`,
        articleId: selectedArticle.id,
        article: selectedArticle,
        scheduledFor: scheduledDate,
        timeSlot: scheduleForm.timeSlot,
        platform: scheduleForm.platform as any,
        priority: scheduleForm.priority as any,
        status: 'scheduled',
        createdBy: user.id,
        estimatedReach: analysis.engagementScore || timeSlotConfig.expectedReach,
        notes: scheduleForm.notes
      };

      setScheduledPosts(current => [...current, newSchedule]);
      
      // Update article status
      if (selectedArticle.status === 'draft') {
        // Here you would update the article status to 'scheduled'
        toast.success('تم جدولة المقال بنجاح');
      }

      onScheduleCreated?.(newSchedule);
      setIsScheduleDialogOpen(false);
      resetForm();

    } catch (error) {
      console.error('Error scheduling article:', error);
      toast.error('حدث خطأ في جدولة المقال');
    }
  };

  const resetForm = () => {
    setSelectedArticle(null);
    setScheduleForm({
      timeSlot: 'morning',
      platform: 'web',
      priority: 'normal',
      notes: '',
      customTime: ''
    });
  };

  // Handle breaking news override
  const handleBreakingNewsOverride = async (article: Article) => {
    const now = new Date();
    const breakingSchedule: ScheduledPost = {
      id: `breaking_${Date.now()}`,
      articleId: article.id,
      article,
      scheduledFor: new Date(now.getTime() + 60000), // 1 minute from now
      timeSlot: 'morning',
      platform: 'all',
      priority: 'breaking',
      status: 'scheduled',
      createdBy: user!.id,
      estimatedReach: 100,
      notes: 'خبر عاجل - نشر فوري'
    };

    setScheduledPosts(current => [...current, breakingSchedule]);
    toast.success('تم جدولة الخبر العاجل للنشر خلال دقيقة');
  };

  const getStatusColor = (status: ScheduledPost['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'published': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: ScheduledPost['priority']) => {
    switch (priority) {
      case 'breaking': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'normal': return 'bg-blue-500 text-white';
      case 'low': return 'bg-gray-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">جدولة النشر</h1>
          <p className="text-muted-foreground">إدارة مواقيت نشر المقالات</p>
        </div>
        
        <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={20} />
              جدولة مقال جديد
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-2xl" dir="rtl">
            <DialogHeader>
              <DialogTitle>جدولة مقال للنشر</DialogTitle>
              <DialogDescription>
                اختر المقال والوقت المناسب للنشر
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Article Selection */}
              <div>
                <Label>اختيار المقال</Label>
                <Select onValueChange={(value) => {
                  const article = articles.find(a => a.id === value);
                  setSelectedArticle(article || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر مقالاً" />
                  </SelectTrigger>
                  <SelectContent>
                    {articles.filter(a => a.status === 'draft' || a.status === 'ready').map(article => (
                      <SelectItem key={article.id} value={article.id}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{article.category?.name}</Badge>
                          {article.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Time Slot Selection */}
              <div>
                <Label>الفترة الزمنية</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {Object.entries(TIME_SLOTS).map(([key, slot]) => (
                    <Card
                      key={key}
                      className={`cursor-pointer transition-colors ${
                        scheduleForm.timeSlot === key ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => setScheduleForm(prev => ({ ...prev, timeSlot: key as any }))}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{slot.name}</p>
                            <p className="text-sm text-muted-foreground">{slot.timeRange}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary">{slot.expectedReach}%</Badge>
                            <p className="text-xs text-muted-foreground mt-1">{slot.audienceType}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Custom Time */}
              <div>
                <Label>وقت مخصص (اختياري)</Label>
                <Input
                  type="time"
                  value={scheduleForm.customTime}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, customTime: e.target.value }))}
                />
              </div>

              {/* Platform and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المنصة</Label>
                  <Select value={scheduleForm.platform} onValueChange={(value) => 
                    setScheduleForm(prev => ({ ...prev, platform: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="web">الموقع فقط</SelectItem>
                      <SelectItem value="social">وسائل التواصل</SelectItem>
                      <SelectItem value="newsletter">النشرة البريدية</SelectItem>
                      <SelectItem value="all">جميع المنصات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>الأولوية</Label>
                  <Select value={scheduleForm.priority} onValueChange={(value) =>
                    setScheduleForm(prev => ({ ...prev, priority: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="normal">عادية</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                      <SelectItem value="breaking">عاجل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label>ملاحظات</Label>
                <Textarea
                  value={scheduleForm.notes}
                  onChange={(e) => setScheduleForm(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="ملاحظات إضافية..."
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleScheduleArticle} disabled={!selectedArticle}>
                  <Calendar className="ml-2" size={16} />
                  جدولة المقال
                </Button>
                
                {selectedArticle && (
                  <Button 
                    variant="destructive" 
                    onClick={() => handleBreakingNewsOverride(selectedArticle)}
                  >
                    <Zap className="ml-2" size={16} />
                    نشر عاجل
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {safeDateFormat(selectedDate, 'ar-SA', { month: 'long', year: 'numeric' })}
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() - 1)))}
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                اليوم
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date(selectedDate.setMonth(selectedDate.getMonth() + 1)))}
              >
                →
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(day => (
              <div key={day} className="p-2 text-center font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const postsForDay = getPostsForDate(day);
              const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
              const isToday = day.toDateString() === new Date().toDateString();
              
              return (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 border rounded-lg ${
                    isCurrentMonth ? 'bg-background' : 'bg-muted/50 text-muted-foreground'
                  } ${isToday ? 'ring-2 ring-primary' : ''}`}
                >
                  <div className="font-medium text-sm mb-2">{day.getDate()}</div>
                  
                  <div className="space-y-1">
                    {postsForDay.slice(0, 3).map(post => (
                      <div
                        key={post.id}
                        className={`text-xs p-1 rounded truncate ${getPriorityColor(post.priority)}`}
                        title={post.article.title}
                      >
                        <div className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(post.status)}`} />
                          {post.article.title.substring(0, 20)}...
                        </div>
                      </div>
                    ))}
                    
                    {postsForDay.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{postsForDay.length - 3} أخرى
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Scheduled Posts */}
      <Card>
        <CardHeader>
          <CardTitle>المقالات المجدولة القادمة</CardTitle>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-3">
            {scheduledPosts
              .filter(post => new Date(post.scheduledFor) > new Date())
              .sort((a, b) => new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime())
              .slice(0, 10)
              .map(post => (
                <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(post.status)}`} />
                    <div>
                      <p className="font-medium">{post.article.title}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock size={14} />
                        {safeDateFormat(post.scheduledFor, 'ar-SA')} - 
                        {safeTimeFormat(post.scheduledFor, 'ar-SA', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                        <Badge variant="outline" className={getPriorityColor(post.priority)}>
                          {post.priority}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      <TrendingUp size={12} className="ml-1" />
                      {post.estimatedReach}%
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Edit size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash size={16} />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}