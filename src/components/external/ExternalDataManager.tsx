import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
  Cloud, 
  Sun, 
  CloudRain, 
  Image, 
  Video, 
  Database, 
  Wifi, 
  Settings,
  RefreshCw,
  MapPin,
  Thermometer,
  Eye,
  Download,
  Clock,
  Activity
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';

interface WeatherData {
  city: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: string;
  timestamp: Date;
}

interface VisualContent {
  id: string;
  type: 'image' | 'video' | 'graphic';
  title: string;
  url: string;
  thumbnail: string;
  source: string;
  tags: string[];
  license: string;
  downloadCount: number;
  lastAccess: Date;
}

interface ExternalSource {
  id: string;
  name: string;
  type: 'weather' | 'media' | 'news' | 'social';
  apiKey: string;
  endpoint: string;
  isActive: boolean;
  lastSync: Date;
  rateLimit: {
    requests: number;
    period: 'hour' | 'day';
    remaining: number;
  };
}

export function ExternalDataManager() {
  const [weatherData, setWeatherData] = useKV<WeatherData[]>('sabq-weather-data', []);
  const [visualContent, setVisualContent] = useKV<VisualContent[]>('sabq-visual-content', []);
  const [externalSources, setExternalSources] = useKV<ExternalSource[]>('sabq-external-sources', [
    {
      id: 'openweather',
      name: 'OpenWeatherMap',
      type: 'weather',
      apiKey: '',
      endpoint: 'https://api.openweathermap.org/data/2.5',
      isActive: false,
      lastSync: new Date(),
      rateLimit: { requests: 1000, period: 'day', remaining: 1000 }
    },
    {
      id: 'unsplash',
      name: 'Unsplash',
      type: 'media',
      apiKey: '',
      endpoint: 'https://api.unsplash.com',
      isActive: false,
      lastSync: new Date(),
      rateLimit: { requests: 50, period: 'hour', remaining: 50 }
    },
    {
      id: 'pexels',
      name: 'Pexels',
      type: 'media',
      apiKey: '',
      endpoint: 'https://api.pexels.com/v1',
      isActive: false,
      lastSync: new Date(),
      rateLimit: { requests: 200, period: 'hour', remaining: 200 }
    }
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('الرياض');
  const [searchQuery, setSearchQuery] = useState('');

  // Weather data fetching
  const fetchWeatherData = async (city: string) => {
    const weatherSource = externalSources.find(s => s.id === 'openweather');
    if (!weatherSource?.isActive || !weatherSource.apiKey) {
      toast.error('مصدر بيانات الطقس غير مكون بشكل صحيح');
      return;
    }

    setIsLoading(true);
    try {
      // Mock weather data for demonstration
      const mockWeatherData: WeatherData = {
        city,
        temperature: Math.round(Math.random() * 30 + 15),
        condition: ['مشمس', 'غائم جزئياً', 'ممطر', 'عاصف'][Math.floor(Math.random() * 4)],
        humidity: Math.round(Math.random() * 60 + 20),
        windSpeed: Math.round(Math.random() * 20 + 5),
        icon: 'sun',
        timestamp: new Date()
      };

      setWeatherData(current => {
        const filtered = current.filter(w => w.city !== city);
        return [...filtered, mockWeatherData];
      });

      toast.success(`تم تحديث بيانات الطقس لـ ${city}`);
    } catch (error) {
      toast.error('فشل في جلب بيانات الطقس');
    } finally {
      setIsLoading(false);
    }
  };

  // Visual content fetching
  const fetchVisualContent = async (query: string) => {
    const unsplashSource = externalSources.find(s => s.id === 'unsplash');
    if (!unsplashSource?.isActive || !unsplashSource.apiKey) {
      toast.error('مصدر المحتوى المرئي غير مكون بشكل صحيح');
      return;
    }

    setIsLoading(true);
    try {
      // Mock visual content for demonstration
      const mockContent: VisualContent[] = Array.from({ length: 8 }, (_, i) => ({
        id: `content_${Date.now()}_${i}`,
        type: ['image', 'video', 'graphic'][Math.floor(Math.random() * 3)] as any,
        title: `${query} - صورة ${i + 1}`,
        url: `https://picsum.photos/800/600?random=${Date.now() + i}`,
        thumbnail: `https://picsum.photos/200/150?random=${Date.now() + i}`,
        source: 'Unsplash',
        tags: [query, 'عالي الجودة', 'مجاني'],
        license: 'Creative Commons',
        downloadCount: Math.floor(Math.random() * 1000),
        lastAccess: new Date()
      }));

      setVisualContent(current => [...current, ...mockContent]);
      toast.success(`تم جلب ${mockContent.length} عنصر مرئي جديد`);
    } catch (error) {
      toast.error('فشل في جلب المحتوى المرئي');
    } finally {
      setIsLoading(false);
    }
  };

  // Source configuration
  const updateSourceConfig = (sourceId: string, updates: Partial<ExternalSource>) => {
    setExternalSources(current => 
      current.map(source => 
        source.id === sourceId 
          ? { ...source, ...updates }
          : source
      )
    );
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'مشمس': return <Sun className="h-6 w-6 text-yellow-500" />;
      case 'غائم جزئياً': return <Cloud className="h-6 w-6 text-gray-500" />;
      case 'ممطر': return <CloudRain className="h-6 w-6 text-blue-500" />;
      default: return <Cloud className="h-6 w-6 text-gray-500" />;
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'graphic': return <Database className="h-4 w-4" />;
      default: return <Image className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة المصادر الخارجية</h1>
          <p className="text-muted-foreground">ربط النظام بمصادر البيانات الخارجية للمحتوى المرئي والطقس</p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Activity className="h-4 w-4" />
          {externalSources.filter(s => s.isActive).length} مصدر نشط
        </Badge>
      </div>

      <Tabs defaultValue="weather" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="weather">بيانات الطقس</TabsTrigger>
          <TabsTrigger value="media">المحتوى المرئي</TabsTrigger>
          <TabsTrigger value="sources">إعدادات المصادر</TabsTrigger>
          <TabsTrigger value="usage">استخدام المصادر</TabsTrigger>
        </TabsList>

        <TabsContent value="weather" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="h-5 w-5" />
                بيانات الطقس الحية
              </CardTitle>
              <CardDescription>
                جلب بيانات الطقس الحالية للمدن السعودية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="city">المدينة</Label>
                  <Input
                    id="city"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    placeholder="أدخل اسم المدينة"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => fetchWeatherData(selectedCity)}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    تحديث البيانات
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weatherData.map((weather, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{weather.city}</span>
                      </div>
                      {getWeatherIcon(weather.condition)}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-muted-foreground" />
                        <span className="text-2xl font-bold">{weather.temperature}°م</span>
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>الحالة: {weather.condition}</div>
                        <div>الرطوبة: {weather.humidity}%</div>
                        <div>سرعة الرياح: {weather.windSpeed} كم/س</div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          آخر تحديث: {weather.timestamp.toLocaleTimeString('ar-SA')}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Image className="h-5 w-5" />
                المحتوى المرئي الخارجي
              </CardTitle>
              <CardDescription>
                البحث وجلب الصور ومقاطع الفيديو من مصادر خارجية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">البحث عن محتوى</Label>
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="أدخل كلمة البحث (مثل: طبيعة، تقنية، أعمال)"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={() => fetchVisualContent(searchQuery)}
                    disabled={isLoading || !searchQuery}
                    className="gap-2"
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                    بحث
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {visualContent.slice(-8).map((content) => (
                  <Card key={content.id} className="overflow-hidden">
                    <div className="aspect-video relative">
                      <img 
                        src={content.thumbnail} 
                        alt={content.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="gap-1">
                          {getContentIcon(content.type)}
                          {content.type}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="p-3 space-y-2">
                      <h4 className="font-medium text-sm line-clamp-2">{content.title}</h4>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{content.source}</span>
                        <div className="flex items-center gap-1">
                          <Download className="h-3 w-3" />
                          {content.downloadCount}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {content.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <Button size="sm" className="w-full gap-2">
                        <Download className="h-3 w-3" />
                        استخدام
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                إعدادات المصادر الخارجية
              </CardTitle>
              <CardDescription>
                تكوين وإدارة مصادر البيانات الخارجية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {externalSources.map((source) => (
                <Card key={source.id} className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        {source.type === 'weather' && <Cloud className="h-5 w-5 text-primary" />}
                        {source.type === 'media' && <Image className="h-5 w-5 text-primary" />}
                      </div>
                      <div>
                        <h3 className="font-medium">{source.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {source.type === 'weather' ? 'بيانات الطقس' : 'محتوى مرئي'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Badge variant={source.isActive ? 'default' : 'secondary'}>
                        {source.isActive ? 'نشط' : 'معطل'}
                      </Badge>
                      <Switch
                        checked={source.isActive}
                        onCheckedChange={(checked) => 
                          updateSourceConfig(source.id, { isActive: checked })
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`${source.id}-key`}>API Key</Label>
                      <Input
                        id={`${source.id}-key`}
                        type="password"
                        value={source.apiKey}
                        onChange={(e) => 
                          updateSourceConfig(source.id, { apiKey: e.target.value })
                        }
                        placeholder="أدخل مفتاح API"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`${source.id}-endpoint`}>نقطة النهاية</Label>
                      <Input
                        id={`${source.id}-endpoint`}
                        value={source.endpoint}
                        onChange={(e) => 
                          updateSourceConfig(source.id, { endpoint: e.target.value })
                        }
                        placeholder="رابط API"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between text-sm">
                      <span>آخر مزامنة:</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {source.lastSync.toLocaleString('ar-SA')}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span>حد الاستخدام:</span>
                      <span>
                        {source.rateLimit.remaining}/{source.rateLimit.requests} في {source.rateLimit.period === 'hour' ? 'الساعة' : 'اليوم'}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wifi className="h-5 w-5" />
                  حالة الاتصال
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {externalSources.map((source) => (
                    <div key={source.id} className="flex items-center justify-between">
                      <span className="text-sm">{source.name}</span>
                      <Badge variant={source.isActive ? 'default' : 'secondary'}>
                        {source.isActive ? 'متصل' : 'غير متصل'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  استخدام اليوم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">طلبات الطقس</span>
                    <span className="font-medium">{Math.floor(Math.random() * 50)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">تحميل صور</span>
                    <span className="font-medium">{visualContent.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">إجمالي البيانات</span>
                    <span className="font-medium">{Math.floor(Math.random() * 100)} MB</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  المحتوى المحفوظ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">بيانات طقس</span>
                    <span className="font-medium">{weatherData.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">محتوى مرئي</span>
                    <span className="font-medium">{visualContent.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">آخر تحديث</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date().toLocaleTimeString('ar-SA')}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}