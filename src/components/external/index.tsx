import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Cloud,
  Sun,
  CloudRain,
  Image as ImageIcon,
  MapPin,
  Thermometer,
  Plus,
  RefreshCw,
  Calendar,
  Clock,
  TrendingUp
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';

interface WeatherWidget {
  id: string;
  city: string;
  position: 'header' | 'sidebar' | 'article';
  style: 'minimal' | 'detailed' | 'card';
  isActive: boolean;
  data?: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
    icon: string;
    timestamp: Date;
  };
}

interface VisualContentWidget {
  id: string;
  query: string;
  category: string;
  autoRefresh: boolean;
  maxItems: number;
  layout: 'grid' | 'carousel' | 'list';
  position: 'hero' | 'sidebar' | 'footer';
  isActive: boolean;
  content: Array<{
    id: string;
    url: string;
    title: string;
    source: string;
    tags: string[];
  }>;
}

interface WeatherIntegrationProps {
  onWeatherUpdate?: (data: any) => void;
}

interface MediaIntegrationProps {
  onMediaSelect?: (media: any) => void;
  category?: string;
}

// Weather Widget Component
export function WeatherWidget({ widget, onUpdate }: { widget: WeatherWidget; onUpdate: (widget: WeatherWidget) => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const refreshWeather = async () => {
    setIsLoading(true);
    try {
      // Mock weather data - in real implementation, would call actual API
      const mockData = {
        temperature: Math.round(Math.random() * 30 + 15),
        condition: ['مشمس', 'غائم جزئياً', 'ممطر', 'عاصف'][Math.floor(Math.random() * 4)],
        humidity: Math.round(Math.random() * 60 + 20),
        windSpeed: Math.round(Math.random() * 20 + 5),
        icon: 'sun',
        timestamp: new Date()
      };

      onUpdate({ ...widget, data: mockData });
      toast.success(`تم تحديث طقس ${widget.city}`);
    } catch (error) {
      toast.error('فشل في تحديث بيانات الطقس');
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (condition: string) => {
    switch (condition) {
      case 'مشمس': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'غائم جزئياً': return <Cloud className="h-4 w-4 text-gray-500" />;
      case 'ممطر': return <CloudRain className="h-4 w-4 text-blue-500" />;
      default: return <Cloud className="h-4 w-4 text-gray-500" />;
    }
  };

  if (widget.style === 'minimal') {
    return (
      <div className="flex items-center gap-2 text-sm">
        {widget.data && (
          <>
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{widget.city}</span>
            {getWeatherIcon(widget.data.condition)}
            <span className="font-medium">{widget.data.temperature}°م</span>
          </>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={refreshWeather}
          disabled={isLoading}
          className="h-6 w-6 p-0"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
    );
  }

  if (widget.style === 'card') {
    return (
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-sm">{widget.city}</span>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={refreshWeather}
            disabled={isLoading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        {widget.data && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {getWeatherIcon(widget.data.condition)}
              <span className="text-lg font-bold">{widget.data.temperature}°م</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>{widget.data.condition}</div>
              <div>الرطوبة: {widget.data.humidity}%</div>
            </div>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">طقس {widget.city}</h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={refreshWeather}
          disabled={isLoading}
          className="gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>
      
      {widget.data && (
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1">
            <Thermometer className="h-3 w-3" />
            {widget.data.temperature}°م
          </div>
          <div className="flex items-center gap-1">
            {getWeatherIcon(widget.data.condition)}
            {widget.data.condition}
          </div>
          <div>الرطوبة: {widget.data.humidity}%</div>
          <div>الرياح: {widget.data.windSpeed} كم/س</div>
        </div>
      )}
    </div>
  );
}

// Media Gallery Widget Component
export function MediaGalleryWidget({ widget, onUpdate }: { widget: VisualContentWidget; onUpdate: (widget: VisualContentWidget) => void }) {
  const [isLoading, setIsLoading] = useState(false);

  const refreshContent = async () => {
    setIsLoading(true);
    try {
      // Mock media content - in real implementation, would call actual API
      const mockContent = Array.from({ length: widget.maxItems }, (_, i) => ({
        id: `media_${Date.now()}_${i}`,
        url: `https://picsum.photos/400/300?random=${Date.now() + i}`,
        title: `${widget.query} - صورة ${i + 1}`,
        source: 'Unsplash',
        tags: [widget.query, 'عالي الجودة']
      }));

      onUpdate({ ...widget, content: mockContent });
      toast.success(`تم تحديث محتوى ${widget.query}`);
    } catch (error) {
      toast.error('فشل في تحديث المحتوى المرئي');
    } finally {
      setIsLoading(false);
    }
  };

  if (widget.layout === 'carousel') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">معرض {widget.query}</h4>
          <Button
            size="sm"
            variant="ghost"
            onClick={refreshContent}
            disabled={isLoading}
            className="gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2">
          {widget.content.map((item) => (
            <div key={item.id} className="flex-shrink-0 w-32">
              <img 
                src={item.url} 
                alt={item.title}
                className="w-full h-20 object-cover rounded"
              />
              <p className="text-xs mt-1 line-clamp-2">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (widget.layout === 'grid') {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-medium">معرض {widget.query}</h4>
          <Button
            size="sm"
            variant="ghost"
            onClick={refreshContent}
            disabled={isLoading}
            className="gap-1"
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          {widget.content.slice(0, 4).map((item) => (
            <div key={item.id} className="space-y-1">
              <img 
                src={item.url} 
                alt={item.title}
                className="w-full h-24 object-cover rounded"
              />
              <p className="text-xs line-clamp-1">{item.title}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">محتوى {widget.query}</h4>
        <Button
          size="sm"
          variant="ghost"
          onClick={refreshContent}
          disabled={isLoading}
          className="gap-1"
        >
          <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          تحديث
        </Button>
      </div>
      
      <div className="space-y-2">
        {widget.content.slice(0, 3).map((item) => (
          <div key={item.id} className="flex gap-2">
            <img 
              src={item.url} 
              alt={item.title}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm line-clamp-2">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.source}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main Widget Manager Component
export function WidgetManager() {
  const [weatherWidgets, setWeatherWidgets] = useKV<WeatherWidget[]>('sabq-weather-widgets', []);
  const [mediaWidgets, setMediaWidgets] = useKV<VisualContentWidget[]>('sabq-media-widgets', []);
  const [showWeatherForm, setShowWeatherForm] = useState(false);
  const [showMediaForm, setShowMediaForm] = useState(false);
  const [newWeatherWidget, setNewWeatherWidget] = useState<Partial<WeatherWidget>>({
    city: 'الرياض',
    position: 'sidebar',
    style: 'card',
    isActive: true
  });
  const [newMediaWidget, setNewMediaWidget] = useState<Partial<VisualContentWidget>>({
    query: 'طبيعة',
    category: 'عام',
    autoRefresh: true,
    maxItems: 6,
    layout: 'grid',
    position: 'sidebar',
    isActive: true,
    content: []
  });

  const createWeatherWidget = () => {
    const widget: WeatherWidget = {
      id: `weather_${Date.now()}`,
      city: newWeatherWidget.city!,
      position: newWeatherWidget.position!,
      style: newWeatherWidget.style!,
      isActive: newWeatherWidget.isActive!
    };

    setWeatherWidgets(current => [...current, widget]);
    setShowWeatherForm(false);
    setNewWeatherWidget({
      city: 'الرياض',
      position: 'sidebar',
      style: 'card',
      isActive: true
    });
    toast.success('تم إنشاء ودجت الطقس');
  };

  const createMediaWidget = () => {
    const widget: VisualContentWidget = {
      id: `media_${Date.now()}`,
      query: newMediaWidget.query!,
      category: newMediaWidget.category!,
      autoRefresh: newMediaWidget.autoRefresh!,
      maxItems: newMediaWidget.maxItems!,
      layout: newMediaWidget.layout!,
      position: newMediaWidget.position!,
      isActive: newMediaWidget.isActive!,
      content: []
    };

    setMediaWidgets(current => [...current, widget]);
    setShowMediaForm(false);
    setNewMediaWidget({
      query: 'طبيعة',
      category: 'عام',
      autoRefresh: true,
      maxItems: 6,
      layout: 'grid',
      position: 'sidebar',
      isActive: true,
      content: []
    });
    toast.success('تم إنشاء ودجت المحتوى المرئي');
  };

  const updateWeatherWidget = (widget: WeatherWidget) => {
    setWeatherWidgets(current => 
      current.map(w => w.id === widget.id ? widget : w)
    );
  };

  const updateMediaWidget = (widget: VisualContentWidget) => {
    setMediaWidgets(current => 
      current.map(w => w.id === widget.id ? widget : w)
    );
  };

  const deleteWeatherWidget = (id: string) => {
    setWeatherWidgets(current => current.filter(w => w.id !== id));
    toast.success('تم حذف ودجت الطقس');
  };

  const deleteMediaWidget = (id: string) => {
    setMediaWidgets(current => current.filter(w => w.id !== id));
    toast.success('تم حذف ودجت المحتوى المرئي');
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة الودجت التفاعلية</h1>
          <p className="text-muted-foreground">إنشاء وإدارة ودجت البيانات الخارجية للواجهة</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowWeatherForm(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            ودجت طقس
          </Button>
          <Button onClick={() => setShowMediaForm(true)} variant="outline" className="gap-2">
            <Plus className="h-4 w-4" />
            ودجت محتوى
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weather Widgets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              ودجت الطقس ({weatherWidgets.length})
            </CardTitle>
            <CardDescription>ودجت عرض بيانات الطقس في الواجهة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weatherWidgets.map((widget) => (
              <div key={widget.id} className="p-3 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={widget.isActive ? 'default' : 'secondary'}>
                      {widget.isActive ? 'نشط' : 'معطل'}
                    </Badge>
                    <span className="text-sm font-medium">{widget.city}</span>
                    <Badge variant="outline">{widget.style}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteWeatherWidget(widget.id)}
                  >
                    حذف
                  </Button>
                </div>
                
                <WeatherWidget widget={widget} onUpdate={updateWeatherWidget} />
              </div>
            ))}

            {weatherWidgets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Cloud className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد ودجت طقس</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Media Widgets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              ودجت المحتوى المرئي ({mediaWidgets.length})
            </CardTitle>
            <CardDescription>ودجت عرض المحتوى المرئي من المصادر الخارجية</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {mediaWidgets.map((widget) => (
              <div key={widget.id} className="p-3 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={widget.isActive ? 'default' : 'secondary'}>
                      {widget.isActive ? 'نشط' : 'معطل'}
                    </Badge>
                    <span className="text-sm font-medium">{widget.query}</span>
                    <Badge variant="outline">{widget.layout}</Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteMediaWidget(widget.id)}
                  >
                    حذف
                  </Button>
                </div>
                
                <MediaGalleryWidget widget={widget} onUpdate={updateMediaWidget} />
              </div>
            ))}

            {mediaWidgets.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>لا توجد ودجت محتوى مرئي</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weather Widget Form */}
      {showWeatherForm && (
        <Card>
          <CardHeader>
            <CardTitle>إنشاء ودجت طقس جديد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>المدينة</Label>
                <Input
                  value={newWeatherWidget.city}
                  onChange={(e) => setNewWeatherWidget({...newWeatherWidget, city: e.target.value})}
                  placeholder="اسم المدينة"
                />
              </div>
              <div>
                <Label>الموقع في الواجهة</Label>
                <Select 
                  value={newWeatherWidget.position} 
                  onValueChange={(value: any) => setNewWeatherWidget({...newWeatherWidget, position: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">الهيدر</SelectItem>
                    <SelectItem value="sidebar">الشريط الجانبي</SelectItem>
                    <SelectItem value="article">داخل المقال</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>النمط</Label>
                <Select 
                  value={newWeatherWidget.style} 
                  onValueChange={(value: any) => setNewWeatherWidget({...newWeatherWidget, style: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="minimal">مبسط</SelectItem>
                    <SelectItem value="detailed">تفصيلي</SelectItem>
                    <SelectItem value="card">بطاقة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={createWeatherWidget}>إنشاء الودجت</Button>
              <Button variant="outline" onClick={() => setShowWeatherForm(false)}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Media Widget Form */}
      {showMediaForm && (
        <Card>
          <CardHeader>
            <CardTitle>إنشاء ودجت محتوى مرئي جديد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>كلمة البحث</Label>
                <Input
                  value={newMediaWidget.query}
                  onChange={(e) => setNewMediaWidget({...newMediaWidget, query: e.target.value})}
                  placeholder="مثل: طبيعة، تقنية، أعمال"
                />
              </div>
              <div>
                <Label>التصنيف</Label>
                <Select 
                  value={newMediaWidget.category} 
                  onValueChange={(value) => setNewMediaWidget({...newMediaWidget, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="عام">عام</SelectItem>
                    <SelectItem value="أخبار">أخبار</SelectItem>
                    <SelectItem value="رياضة">رياضة</SelectItem>
                    <SelectItem value="تقنية">تقنية</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>عدد العناصر</Label>
                <Select 
                  value={String(newMediaWidget.maxItems)} 
                  onValueChange={(value) => setNewMediaWidget({...newMediaWidget, maxItems: Number(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 عناصر</SelectItem>
                    <SelectItem value="6">6 عناصر</SelectItem>
                    <SelectItem value="9">9 عناصر</SelectItem>
                    <SelectItem value="12">12 عنصر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>التخطيط</Label>
                <Select 
                  value={newMediaWidget.layout} 
                  onValueChange={(value: any) => setNewMediaWidget({...newMediaWidget, layout: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">شبكة</SelectItem>
                    <SelectItem value="carousel">عرض متحرك</SelectItem>
                    <SelectItem value="list">قائمة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={createMediaWidget}>إنشاء الودجت</Button>
              <Button variant="outline" onClick={() => setShowMediaForm(false)}>إلغاء</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export { ExternalDataManager } from './ExternalDataManager';
export { NewsAggregator } from './NewsAggregator';