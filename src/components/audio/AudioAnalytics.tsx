import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Play,
  Download,
  Share,
  Heart,
  MessageSquare,
  Clock,
  Globe,
  Calendar,
  Headphones,
  VolumeHigh,
  Timer,
  StarFill,
  MapPin,
  DeviceMobile,
  Desktop,
  Tablet,
  Eye,
  Target,
  Activity,
  Zap
} from '@phosphor-icons/react';
import { AudioProject } from '@/types';
import { useKV } from '@github/spark/hooks';
import { toast } from 'sonner';

interface AudioAnalytics {
  projectId: string;
  totalPlays: number;
  uniqueListeners: number;
  completionRate: number;
  averageListenTime: number;
  totalDuration: number;
  downloads: number;
  shares: number;
  likes: number;
  comments: number;
  rating: number;
  demographics: {
    ageGroups: { group: string; percentage: number }[];
    gender: { male: number; female: number };
    locations: { country: string; city: string; listeners: number }[];
  };
  devices: {
    mobile: number;
    desktop: number;
    tablet: number;
    smart_speaker: number;
  };
  timeAnalysis: {
    dropOffPoints: { timestamp: number; percentage: number }[];
    peakListening: { hour: number; listeners: number }[];
    weeklyPattern: { day: string; plays: number }[];
  };
  engagement: {
    skipRate: number;
    replayRate: number;
    subscriptionRate: number;
    shareRate: number;
  };
  performance: {
    loadTime: number;
    bufferingEvents: number;
    errorRate: number;
    qualityScore: number;
  };
  monetization?: {
    revenue: number;
    adRevenue: number;
    sponsorshipRevenue: number;
    donationRevenue: number;
  };
  trends: {
    weeklyGrowth: number;
    monthlyGrowth: number;
    yearlyGrowth: number;
  };
  comparisons: {
    categoryAverage: number;
    platformAverage: number;
    previousProjects: number;
  };
}

interface AudioAnalyticsProps {
  projects: AudioProject[];
  selectedProject?: AudioProject;
  onProjectSelect: (project: AudioProject) => void;
}

const DEMO_ANALYTICS: AudioAnalytics[] = [
  {
    projectId: 'project_1',
    totalPlays: 15420,
    uniqueListeners: 8230,
    completionRate: 78.5,
    averageListenTime: 485,
    totalDuration: 620,
    downloads: 1240,
    shares: 890,
    likes: 2150,
    comments: 340,
    rating: 4.6,
    demographics: {
      ageGroups: [
        { group: '18-24', percentage: 25 },
        { group: '25-34', percentage: 35 },
        { group: '35-44', percentage: 28 },
        { group: '45+', percentage: 12 }
      ],
      gender: { male: 65, female: 35 },
      locations: [
        { country: 'السعودية', city: 'الرياض', listeners: 3200 },
        { country: 'السعودية', city: 'جدة', listeners: 2100 },
        { country: 'الإمارات', city: 'دبي', listeners: 1800 },
        { country: 'الكويت', city: 'الكويت', listeners: 950 }
      ]
    },
    devices: {
      mobile: 68,
      desktop: 22,
      tablet: 8,
      smart_speaker: 2
    },
    timeAnalysis: {
      dropOffPoints: [
        { timestamp: 30, percentage: 12 },
        { timestamp: 120, percentage: 25 },
        { timestamp: 300, percentage: 45 },
        { timestamp: 450, percentage: 65 }
      ],
      peakListening: [
        { hour: 7, listeners: 890 },
        { hour: 12, listeners: 1240 },
        { hour: 18, listeners: 1580 },
        { hour: 21, listeners: 1320 }
      ],
      weeklyPattern: [
        { day: 'الأحد', plays: 2100 },
        { day: 'الاثنين', plays: 2800 },
        { day: 'الثلاثاء', plays: 2650 },
        { day: 'الأربعاء', plays: 2400 },
        { day: 'الخميس', plays: 2200 },
        { day: 'الجمعة', plays: 1900 },
        { day: 'السبت', plays: 1370 }
      ]
    },
    engagement: {
      skipRate: 15.2,
      replayRate: 23.8,
      subscriptionRate: 12.5,
      shareRate: 5.8
    },
    performance: {
      loadTime: 2.1,
      bufferingEvents: 0.8,
      errorRate: 0.2,
      qualityScore: 94
    },
    monetization: {
      revenue: 1250,
      adRevenue: 780,
      sponsorshipRevenue: 350,
      donationRevenue: 120
    },
    trends: {
      weeklyGrowth: 12.5,
      monthlyGrowth: 45.2,
      yearlyGrowth: 180.5
    },
    comparisons: {
      categoryAverage: 15.2,
      platformAverage: 8.7,
      previousProjects: 25.8
    }
  }
];

export function AudioAnalytics({ projects, selectedProject, onProjectSelect }: AudioAnalyticsProps) {
  const [analytics, setAnalytics] = useKV<AudioAnalytics[]>('sabq-audio-analytics', DEMO_ANALYTICS);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [activeTab, setActiveTab] = useState('overview');
  const [comparisonType, setComparisonType] = useState('category');

  const currentAnalytics = selectedProject 
    ? analytics.find(a => a.projectId === selectedProject.id) || analytics[0]
    : analytics[0];

  // Format numbers
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'م';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'ك';
    }
    return num.toString();
  };

  // Format duration
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  // Get trend indicator
  const getTrendIndicator = (value: number) => {
    if (value > 0) {
      return <TrendingUp className="text-green-500" size={16} />;
    } else if (value < 0) {
      return <TrendingDown className="text-red-500" size={16} />;
    }
    return <Activity className="text-gray-500" size={16} />;
  };

  // Render metric card
  const renderMetricCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    trend?: number,
    icon?: React.ReactNode
  ) => (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {icon}
            {trend !== undefined && (
              <div className="flex items-center gap-1">
                {getTrendIndicator(trend)}
                <span className={`text-xs ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                  {Math.abs(trend)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">تحليلات البودكاست</h1>
          <p className="text-muted-foreground">
            تتبع أداء وإحصائيات المحتوى الصوتي
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">اليوم</SelectItem>
              <SelectItem value="7d">7 أيام</SelectItem>
              <SelectItem value="30d">30 يوم</SelectItem>
              <SelectItem value="90d">3 أشهر</SelectItem>
              <SelectItem value="1y">سنة</SelectItem>
            </SelectContent>
          </Select>
          
          {selectedProject && (
            <Select value={selectedProject.id} onValueChange={(value) => {
              const project = projects.find(p => p.id === value);
              if (project) onProjectSelect(project);
            }}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-6 gap-4">
        {renderMetricCard(
          'إجمالي التشغيلات',
          formatNumber(currentAnalytics.totalPlays),
          'في آخر 7 أيام',
          currentAnalytics.trends.weeklyGrowth,
          <Play className="text-primary" size={20} />
        )}
        
        {renderMetricCard(
          'المستمعون الفريدون',
          formatNumber(currentAnalytics.uniqueListeners),
          `${((currentAnalytics.uniqueListeners / currentAnalytics.totalPlays) * 100).toFixed(1)}% من التشغيلات`,
          currentAnalytics.trends.weeklyGrowth * 0.8,
          <Users className="text-blue-500" size={20} />
        )}
        
        {renderMetricCard(
          'معدل الإكمال',
          `${currentAnalytics.completionRate}%`,
          'متوسط الاستماع الكامل',
          5.2,
          <Target className="text-green-500" size={20} />
        )}
        
        {renderMetricCard(
          'وقت الاستماع',
          formatDuration(currentAnalytics.averageListenTime),
          `من ${formatDuration(currentAnalytics.totalDuration)}`,
          -2.1,
          <Timer className="text-orange-500" size={20} />
        )}
        
        {renderMetricCard(
          'التحميلات',
          formatNumber(currentAnalytics.downloads),
          'ملفات محملة',
          8.5,
          <Download className="text-purple-500" size={20} />
        )}
        
        {renderMetricCard(
          'التقييم',
          `${currentAnalytics.rating}/5`,
          `${currentAnalytics.likes} إعجاب`,
          1.2,
          <StarFill className="text-yellow-500" size={20} />
        )}
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="audience">الجمهور</TabsTrigger>
          <TabsTrigger value="engagement">التفاعل</TabsTrigger>
          <TabsTrigger value="performance">الأداء</TabsTrigger>
          <TabsTrigger value="revenue">الإيرادات</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            {/* Listening Pattern */}
            <Card>
              <CardHeader>
                <CardTitle>نمط الاستماع الأسبوعي</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentAnalytics.timeAnalysis.weeklyPattern.map((day, index) => (
                    <div key={day.day} className="flex items-center justify-between">
                      <span className="text-sm">{day.day}</span>
                      <div className="flex items-center gap-2 flex-1 mx-4">
                        <Progress 
                          value={(day.plays / Math.max(...currentAnalytics.timeAnalysis.weeklyPattern.map(d => d.plays))) * 100} 
                          className="flex-1" 
                        />
                        <span className="text-sm text-muted-foreground w-12 text-left">
                          {formatNumber(day.plays)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Drop-off Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>تحليل نقاط التوقف</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentAnalytics.timeAnalysis.dropOffPoints.map((point, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm">{formatDuration(point.timestamp)}</span>
                      <div className="flex items-center gap-2 flex-1 mx-4">
                        <Progress value={point.percentage} className="flex-1" />
                        <span className="text-sm text-muted-foreground w-12 text-left">
                          {point.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Device & Location Stats */}
          <div className="grid grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الأجهزة المستخدمة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DeviceMobile size={16} />
                      <span className="text-sm">الهاتف المحمول</span>
                    </div>
                    <span className="text-sm font-medium">{currentAnalytics.devices.mobile}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Desktop size={16} />
                      <span className="text-sm">الكمبيوتر</span>
                    </div>
                    <span className="text-sm font-medium">{currentAnalytics.devices.desktop}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Tablet size={16} />
                      <span className="text-sm">الجهاز اللوحي</span>
                    </div>
                    <span className="text-sm font-medium">{currentAnalytics.devices.tablet}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <VolumeHigh size={16} />
                      <span className="text-sm">مكبر ذكي</span>
                    </div>
                    <span className="text-sm font-medium">{currentAnalytics.devices.smart_speaker}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>التوزيع الجغرافي</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-32">
                  <div className="space-y-2">
                    {currentAnalytics.demographics.locations.map((location, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} />
                          <span className="text-sm">{location.city}, {location.country}</span>
                        </div>
                        <span className="text-sm font-medium">{formatNumber(location.listeners)}</span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مقارنة الأداء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">متوسط الفئة</span>
                    <span className="text-sm font-medium">
                      +{currentAnalytics.comparisons.categoryAverage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">متوسط المنصة</span>
                    <span className="text-sm font-medium">
                      +{currentAnalytics.comparisons.platformAverage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">المشاريع السابقة</span>
                    <span className="text-sm font-medium">
                      +{currentAnalytics.comparisons.previousProjects}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الفئات العمرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentAnalytics.demographics.ageGroups.map((group, index) => (
                    <div key={group.group} className="flex items-center justify-between">
                      <span className="text-sm">{group.group} سنة</span>
                      <div className="flex items-center gap-2 flex-1 mx-4">
                        <Progress value={group.percentage} className="flex-1" />
                        <span className="text-sm text-muted-foreground w-12 text-left">
                          {group.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع الجنس</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">ذكور</span>
                    <span className="text-2xl font-bold">{currentAnalytics.demographics.gender.male}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">إناث</span>
                    <span className="text-2xl font-bold">{currentAnalytics.demographics.gender.female}%</span>
                  </div>
                  <Progress 
                    value={currentAnalytics.demographics.gender.male} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {renderMetricCard(
              'معدل التخطي',
              `${currentAnalytics.engagement.skipRate}%`,
              'المستمعون الذين تخطوا أجزاء',
              undefined,
              <Activity className="text-red-500" size={20} />
            )}
            
            {renderMetricCard(
              'معدل الإعادة',
              `${currentAnalytics.engagement.replayRate}%`,
              'المستمعون الذين أعادوا التشغيل',
              undefined,
              <Activity className="text-green-500" size={20} />
            )}
            
            {renderMetricCard(
              'معدل المشاركة',
              `${currentAnalytics.engagement.shareRate}%`,
              'المحتوى المشارك',
              undefined,
              <Share className="text-blue-500" size={20} />
            )}
            
            {renderMetricCard(
              'معدل الاشتراك',
              `${currentAnalytics.engagement.subscriptionRate}%`,
              'اشتراكات جديدة',
              undefined,
              <Heart className="text-purple-500" size={20} />
            )}
          </div>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {renderMetricCard(
              'وقت التحميل',
              `${currentAnalytics.performance.loadTime}ث`,
              'متوسط وقت بدء التشغيل',
              undefined,
              <Zap className="text-yellow-500" size={20} />
            )}
            
            {renderMetricCard(
              'أحداث التخزين المؤقت',
              `${currentAnalytics.performance.bufferingEvents}%`,
              'مقاطعات التشغيل',
              undefined,
              <Activity className="text-orange-500" size={20} />
            )}
            
            {renderMetricCard(
              'معدل الأخطاء',
              `${currentAnalytics.performance.errorRate}%`,
              'أخطاء التشغيل',
              undefined,
              <Activity className="text-red-500" size={20} />
            )}
            
            {renderMetricCard(
              'درجة الجودة',
              `${currentAnalytics.performance.qualityScore}/100`,
              'تقييم الأداء العام',
              undefined,
              <Target className="text-green-500" size={20} />
            )}
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          {currentAnalytics.monetization && (
            <div className="grid grid-cols-4 gap-4">
              {renderMetricCard(
                'إجمالي الإيرادات',
                `${currentAnalytics.monetization.revenue} ر.س`,
                'في آخر 30 يوم',
                12.5,
                <BarChart3 className="text-green-500" size={20} />
              )}
              
              {renderMetricCard(
                'إيرادات الإعلانات',
                `${currentAnalytics.monetization.adRevenue} ر.س`,
                'من الإعلانات المدمجة',
                8.2,
                <Activity className="text-blue-500" size={20} />
              )}
              
              {renderMetricCard(
                'إيرادات الرعاية',
                `${currentAnalytics.monetization.sponsorshipRevenue} ر.س`,
                'من الرعايات المباشرة',
                25.8,
                <Activity className="text-purple-500" size={20} />
              )}
              
              {renderMetricCard(
                'التبرعات',
                `${currentAnalytics.monetization.donationRevenue} ر.س`,
                'من دعم المستمعين',
                45.2,
                <Heart className="text-red-500" size={20} />
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}