import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SafeIcon } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { DailyDose } from '@/types';
import { 
  BarChart3, 
  TrendingUp,
  TrendingDown,
  Eye,
  Share,
  Volume2,
  Clock,
  Users,
  Download,
  Calendar,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Zap
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { safeDateFormat } from '@/lib/utils';

interface DoseAnalyticsProps {
  doses: DailyDose[];
  timeRange: '7d' | '30d' | '90d';
}

export function DoseAnalytics({ doses, timeRange }: DoseAnalyticsProps) {
  const { language } = useAuth();
  const isRTL = language.direction === 'rtl';
  const isArabic = language.code === 'ar';

  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('all');

  // Time slot icons and info
  const timeSlotInfo = {
    morning: { icon: Sun, emoji: '☀️', label: isArabic ? 'الصباح' : 'Morning', color: 'text-yellow-600' },
    noon: { icon: CloudSun, emoji: '☁️', label: isArabic ? 'الظهيرة' : 'Noon', color: 'text-blue-600' },
    evening: { icon: Sunset, emoji: '🌇', label: isArabic ? 'المساء' : 'Evening', color: 'text-orange-600' },
    night: { icon: Moon, emoji: '🌙', label: isArabic ? 'الليل' : 'Night', color: 'text-purple-600' }
  };

  // Filter doses based on selected criteria
  const filteredDoses = doses.filter(dose => {
    const doseDate = new Date(dose.date);
    const now = new Date();
    const daysDiff = Math.floor((now.getTime() - doseDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const timeRangeFilter = selectedTimeRange === '7d' ? daysDiff <= 7 
      : selectedTimeRange === '30d' ? daysDiff <= 30 
      : daysDiff <= 90;
    
    const timeSlotFilter = selectedTimeSlot === 'all' || dose.timeSlot === selectedTimeSlot;
    
    return timeRangeFilter && timeSlotFilter;
  });

  // Calculate analytics
  const totalViews = filteredDoses.reduce((sum, dose) => sum + dose.analytics.views, 0);
  const totalShares = filteredDoses.reduce((sum, dose) => sum + dose.analytics.shares, 0);
  const totalAudioPlays = filteredDoses.reduce((sum, dose) => sum + dose.analytics.audioPlays, 0);
  const averageEngagement = filteredDoses.length > 0 
    ? Math.round(filteredDoses.reduce((sum, dose) => sum + dose.analytics.engagement, 0) / filteredDoses.length)
    : 0;

  // Performance by time slot
  const performanceByTimeSlot = Object.entries(timeSlotInfo).map(([slot, info]) => {
    const slotDoses = filteredDoses.filter(d => d.timeSlot === slot);
    const slotViews = slotDoses.reduce((sum, dose) => sum + dose.analytics.views, 0);
    const slotShares = slotDoses.reduce((sum, dose) => sum + dose.analytics.shares, 0);
    const slotEngagement = slotDoses.length > 0 
      ? Math.round(slotDoses.reduce((sum, dose) => sum + dose.analytics.engagement, 0) / slotDoses.length)
      : 0;

    return {
      slot,
      label: info.label,
      emoji: info.emoji,
      icon: info.icon,
      color: info.color,
      count: slotDoses.length,
      views: slotViews,
      shares: slotShares,
      engagement: slotEngagement
    };
  });

  // Top performing doses
  const topDoses = [...filteredDoses]
    .sort((a, b) => b.analytics.views - a.analytics.views)
    .slice(0, 5);

  // Engagement trends (simplified calculation)
  const engagementTrend = filteredDoses.length > 1 
    ? filteredDoses[filteredDoses.length - 1].analytics.engagement - filteredDoses[0].analytics.engagement
    : 0;

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className={cn("text-sm font-medium flex items-center gap-2 font-arabic", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={Eye} className="h-4 w-4 text-blue-600" />
              {isArabic ? 'إجمالي المشاهدات' : 'Total Views'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-arabic">
              {totalViews.toLocaleString()}
            </div>
            <div className={cn("flex items-center gap-1 text-xs text-muted-foreground mt-1", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={TrendingUp} className="h-3 w-3 text-green-600" />
              <span className="font-arabic">+12% {isArabic ? 'من الأسبوع الماضي' : 'from last week'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className={cn("text-sm font-medium flex items-center gap-2 font-arabic", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={Share} className="h-4 w-4 text-green-600" />
              {isArabic ? 'إجمالي المشاركات' : 'Total Shares'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-arabic">
              {totalShares.toLocaleString()}
            </div>
            <div className={cn("flex items-center gap-1 text-xs text-muted-foreground mt-1", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={TrendingUp} className="h-3 w-3 text-green-600" />
              <span className="font-arabic">+8% {isArabic ? 'من الأسبوع الماضي' : 'from last week'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className={cn("text-sm font-medium flex items-center gap-2 font-arabic", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={Volume2} className="h-4 w-4 text-purple-600" />
              {isArabic ? 'تشغيل صوتي' : 'Audio Plays'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-arabic">
              {totalAudioPlays.toLocaleString()}
            </div>
            <div className={cn("flex items-center gap-1 text-xs text-muted-foreground mt-1", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={TrendingUp} className="h-3 w-3 text-green-600" />
              <span className="font-arabic">+25% {isArabic ? 'من الأسبوع الماضي' : 'from last week'}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className={cn("text-sm font-medium flex items-center gap-2 font-arabic", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={Zap} className="h-4 w-4 text-orange-600" />
              {isArabic ? 'معدل التفاعل' : 'Engagement Rate'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-arabic">
              {averageEngagement}%
            </div>
            <div className={cn("flex items-center gap-1 text-xs text-muted-foreground mt-1", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={engagementTrend >= 0 ? TrendingUp : TrendingDown} className={cn("h-3 w-3", engagementTrend >= 0 ? "text-green-600" : "text-red-600")} />
              <span className="font-arabic">
                {engagementTrend >= 0 ? '+' : ''}{engagementTrend}% {isArabic ? 'من الأسبوع الماضي' : 'from last week'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Time Slot Performance */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
            {isArabic ? 'الأداء حسب الفترة الزمنية' : 'Performance by Time Slot'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceByTimeSlot.map(slot => {
              const IconComponent = slot.icon;
              
              return (
                <div key={slot.slot} className="space-y-3">
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <SafeIcon icon={IconComponent} className={cn("h-5 w-5", slot.color)} />
                    <span className="text-lg">{slot.emoji}</span>
                    <h4 className="font-medium font-arabic">{slot.label}</h4>
                  </div>
                  
                  <div className="space-y-2">
                    <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                      <span className="text-muted-foreground font-arabic">
                        {isArabic ? 'الجرعات' : 'Doses'}
                      </span>
                      <span className="font-bold font-arabic">{slot.count}</span>
                    </div>
                    <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                      <span className="text-muted-foreground font-arabic">
                        {isArabic ? 'المشاهدات' : 'Views'}
                      </span>
                      <span className="font-bold font-arabic">{slot.views.toLocaleString()}</span>
                    </div>
                    <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                      <span className="text-muted-foreground font-arabic">
                        {isArabic ? 'المشاركات' : 'Shares'}
                      </span>
                      <span className="font-bold font-arabic">{slot.shares.toLocaleString()}</span>
                    </div>
                    <div className={cn("flex justify-between text-sm", isRTL && "flex-row-reverse")}>
                      <span className="text-muted-foreground font-arabic">
                        {isArabic ? 'التفاعل' : 'Engagement'}
                      </span>
                      <span className="font-bold font-arabic">{slot.engagement}%</span>
                    </div>
                  </div>

                  {/* Performance bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground font-arabic">
                        {isArabic ? 'الأداء' : 'Performance'}
                      </span>
                      <span className="font-arabic">{slot.engagement}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${Math.min(slot.engagement, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Doses */}
      <Card>
        <CardHeader>
          <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
            {isArabic ? 'أفضل الجرعات أداءً' : 'Top Performing Doses'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topDoses.map((dose, index) => {
              const info = timeSlotInfo[dose.timeSlot];
              const IconComponent = info.icon;
              
              return (
                <div key={dose.id} className={cn("flex items-center gap-4 p-3 rounded-lg border", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm">
                      {index + 1}
                    </div>
                    <SafeIcon icon={IconComponent} className={cn("h-4 w-4", info.color)} />
                    <span className="text-sm">{info.emoji}</span>
                  </div>
                  
                  <div className={cn("flex-1 space-y-1", isRTL && "text-right")}>
                    <h5 className="font-medium text-sm font-arabic line-clamp-1">
                      {dose.headline.textAr}
                    </h5>
                    <p className="text-xs text-muted-foreground font-arabic">
                      {safeDateFormat(dose.date, isArabic ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                  
                  <div className={cn("grid grid-cols-3 gap-4 text-center", isRTL && "text-right")}>
                    <div>
                      <div className="text-sm font-bold font-arabic">{dose.analytics.views.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground font-arabic">
                        {isArabic ? 'مشاهدة' : 'views'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold font-arabic">{dose.analytics.shares.toLocaleString()}</div>
                      <div className="text-xs text-muted-foreground font-arabic">
                        {isArabic ? 'مشاركة' : 'shares'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold font-arabic">{dose.analytics.engagement}%</div>
                      <div className="text-xs text-muted-foreground font-arabic">
                        {isArabic ? 'تفاعل' : 'engagement'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTrendsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
            {isArabic ? 'اتجاهات الأداء' : 'Performance Trends'}
          </CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex items-center justify-center">
          <div className={cn("text-center", isRTL && "text-right")}>
            <SafeIcon icon={BarChart3} className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium font-arabic mb-2">
              {isArabic ? 'الرسوم البيانية قيد التطوير' : 'Charts Under Development'}
            </h4>
            <p className="text-sm text-muted-foreground font-arabic">
              {isArabic ? 'سيتم إضافة الرسوم البيانية التفاعلية قريباً' : 'Interactive charts will be added soon'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
              {isArabic ? 'أوقات الذروة' : 'Peak Times'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={cn("text-sm text-muted-foreground font-arabic", isRTL && "text-right")}>
                {isArabic ? 'أفضل أوقات النشر حسب التفاعل:' : 'Best publishing times by engagement:'}
              </div>
              {performanceByTimeSlot
                .sort((a, b) => b.engagement - a.engagement)
                .map((slot, index) => (
                  <div key={slot.slot} className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                    <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-xs">
                        {index + 1}
                      </div>
                      <span className="text-sm">{slot.emoji}</span>
                      <span className="font-medium font-arabic">{slot.label}</span>
                    </div>
                    <Badge variant="secondary" className="font-arabic">
                      {slot.engagement}% {isArabic ? 'تفاعل' : 'engagement'}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className={cn("text-lg font-arabic", isRTL && "text-right")}>
              {isArabic ? 'توصيات التحسين' : 'Optimization Recommendations'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className={cn("p-3 bg-blue-50 rounded-lg", isRTL && "text-right")}>
                <h5 className="font-medium text-sm font-arabic mb-1">
                  {isArabic ? 'زيادة المحتوى الصوتي' : 'Increase Audio Content'}
                </h5>
                <p className="text-xs text-muted-foreground font-arabic">
                  {isArabic ? 'المحتوى الصوتي يحقق تفاعل أعلى بـ 25%' : 'Audio content achieves 25% higher engagement'}
                </p>
              </div>
              
              <div className={cn("p-3 bg-green-50 rounded-lg", isRTL && "text-right")}>
                <h5 className="font-medium text-sm font-arabic mb-1">
                  {isArabic ? 'تحسين توقيت الظهيرة' : 'Optimize Noon Timing'}
                </h5>
                <p className="text-xs text-muted-foreground font-arabic">
                  {isArabic ? 'تأخير النشر إلى 1:30 م قد يزيد المشاهدات' : 'Delaying publication to 1:30 PM may increase views'}
                </p>
              </div>
              
              <div className={cn("p-3 bg-orange-50 rounded-lg", isRTL && "text-right")}>
                <h5 className="font-medium text-sm font-arabic mb-1">
                  {isArabic ? 'تنويع المحتوى المسائي' : 'Diversify Evening Content'}
                </h5>
                <p className="text-xs text-muted-foreground font-arabic">
                  {isArabic ? 'إضافة المزيد من التحليلات العميقة في المساء' : 'Add more deep analysis in evening content'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <div className={cn("space-y-1", isRTL && "text-right")}>
          <h2 className="text-2xl font-bold tracking-tight font-arabic">
            {isArabic ? 'تحليلات الجرعات الذكية' : 'Smart Dose Analytics'}
          </h2>
          <p className="text-muted-foreground font-arabic">
            {isArabic ? 'تحليل أداء الجرعات اليومية والاتجاهات' : 'Analyze daily dose performance and trends'}
          </p>
        </div>
        <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-[120px] font-arabic">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d" className="font-arabic">
                {isArabic ? '7 أيام' : '7 days'}
              </SelectItem>
              <SelectItem value="30d" className="font-arabic">
                {isArabic ? '30 يوم' : '30 days'}
              </SelectItem>
              <SelectItem value="90d" className="font-arabic">
                {isArabic ? '90 يوم' : '90 days'}
              </SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
            <SelectTrigger className="w-[140px] font-arabic">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="font-arabic">
                {isArabic ? 'جميع الفترات' : 'All Time Slots'}
              </SelectItem>
              {Object.entries(timeSlotInfo).map(([slot, info]) => (
                <SelectItem key={slot} value={slot} className="font-arabic">
                  {info.emoji} {info.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="font-arabic">
            <SafeIcon icon={Download} className="h-4 w-4" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className={cn("grid w-full grid-cols-3", isRTL && "grid-flow-row-dense")}>
          <TabsTrigger value="overview" className="font-arabic">
            {isArabic ? 'نظرة عامة' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="trends" className="font-arabic">
            {isArabic ? 'الاتجاهات' : 'Trends'}
          </TabsTrigger>
          <TabsTrigger value="insights" className="font-arabic">
            {isArabic ? 'الرؤى' : 'Insights'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {renderTrendsTab()}
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {renderInsightsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}