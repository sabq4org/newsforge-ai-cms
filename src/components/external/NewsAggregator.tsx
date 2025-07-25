import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  Rss,
  Globe,
  Database,
  Refresh,
  Settings,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Newspaper,
  TrendUp,
  Users,
  Hash
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { safeDateFormat, safeTimeFormat } from '@/lib/utils';

interface NewsSource {
  id: string;
  name: string;
  url: string;
  rssUrl?: string;
  apiUrl?: string;
  apiKey?: string;
  language: 'ar' | 'en';
  category: string;
  isActive: boolean;
  lastSync: Date;
  articleCount: number;
  reliability: 'high' | 'medium' | 'low';
  status: 'connected' | 'error' | 'syncing';
}

interface ExternalArticle {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  url: string;
  author: string;
  publishedAt: Date;
  source: string;
  category: string;
  tags: string[];
  imageUrl?: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  readingTime: number;
  isImported: boolean;
}

interface SocialMediaPost {
  id: string;
  platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin';
  content: string;
  author: string;
  engagement: {
    likes: number;
    shares: number;
    comments: number;
  };
  timestamp: Date;
  hashtags: string[];
  mentions: string[];
  isRelevant: boolean;
}

interface TrendingTopic {
  id: string;
  keyword: string;
  volume: number;
  growth: number;
  category: string;
  relatedTopics: string[];
  timestamp: Date;
}

export function NewsAggregator() {
  const [newsSources, setNewsSources] = useKV<NewsSource[]>('sabq-news-sources', [
    {
      id: 'alarabiya',
      name: 'العربية',
      url: 'https://www.alarabiya.net',
      rssUrl: 'https://www.alarabiya.net/rss.xml',
      language: 'ar',
      category: 'عام',
      isActive: true,
      lastSync: new Date(),
      articleCount: 0,
      reliability: 'high',
      status: 'connected'
    },
    {
      id: 'aljazeera',
      name: 'الجزيرة',
      url: 'https://www.aljazeera.net',
      rssUrl: 'https://www.aljazeera.net/rss.xml',
      language: 'ar',
      category: 'عام',
      isActive: true,
      lastSync: new Date(),
      articleCount: 0,
      reliability: 'high',
      status: 'connected'
    },
    {
      id: 'bbc-arabic',
      name: 'BBC العربية',
      url: 'https://www.bbc.com/arabic',
      rssUrl: 'https://feeds.bbci.co.uk/arabic/rss.xml',
      language: 'ar',
      category: 'دولي',
      isActive: true,
      lastSync: new Date(),
      articleCount: 0,
      reliability: 'high',
      status: 'connected'
    }
  ]);

  const [externalArticles, setExternalArticles] = useKV<ExternalArticle[]>('sabq-external-articles', []);
  const [socialPosts, setSocialPosts] = useKV<SocialMediaPost[]>('sabq-social-posts', []);
  const [trendingTopics, setTrendingTopics] = useKV<TrendingTopic[]>('sabq-trending-topics', []);
  const [isAggregating, setIsAggregating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Aggregate news from sources
  const aggregateNews = async (sourceId?: string) => {
    setIsAggregating(true);
    try {
      const sourcesToSync = sourceId 
        ? newsSources.filter(s => s.id === sourceId && s.isActive)
        : newsSources.filter(s => s.isActive);

      for (const source of sourcesToSync) {
        // Update source status
        updateSourceStatus(source.id, 'syncing');

        // Mock article generation for demonstration
        const mockArticles: ExternalArticle[] = Array.from({ length: 5 }, (_, i) => ({
          id: `${source.id}_article_${Date.now()}_${i}`,
          title: `خبر من ${source.name} - ${i + 1}`,
          content: `محتوى مفصل للخبر رقم ${i + 1} من مصدر ${source.name}. هذا نص تجريبي يمثل محتوى مقال إخباري حقيقي.`,
          excerpt: `ملخص الخبر رقم ${i + 1} من ${source.name}`,
          url: `${source.url}/article-${Date.now()}-${i}`,
          author: `محرر ${source.name}`,
          publishedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
          source: source.name,
          category: source.category,
          tags: ['أخبار', source.category, 'عاجل'],
          imageUrl: `https://picsum.photos/600/400?random=${Date.now() + i}`,
          sentiment: ['positive', 'negative', 'neutral'][Math.floor(Math.random() * 3)] as any,
          readingTime: Math.floor(Math.random() * 5) + 2,
          isImported: false
        }));

        // Add articles
        setExternalArticles(current => [...current, ...mockArticles]);

        // Update source stats
        setNewsSources(current => 
          current.map(s => 
            s.id === source.id 
              ? { 
                  ...s, 
                  lastSync: new Date(), 
                  articleCount: s.articleCount + mockArticles.length,
                  status: 'connected' as const
                }
              : s
          )
        );

        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      toast.success(`تم جلب الأخبار من ${sourcesToSync.length} مصدر`);
    } catch (error) {
      toast.error('فشل في جلب الأخبار من المصادر الخارجية');
    } finally {
      setIsAggregating(false);
    }
  };

  // Update source status
  const updateSourceStatus = (sourceId: string, status: NewsSource['status']) => {
    setNewsSources(current => 
      current.map(source => 
        source.id === sourceId 
          ? { ...source, status }
          : source
      )
    );
  };

  // Import article to main system
  const importArticle = (article: ExternalArticle) => {
    setExternalArticles(current => 
      current.map(a => 
        a.id === article.id 
          ? { ...a, isImported: true }
          : a
      )
    );
    toast.success(`تم استيراد المقال: ${article.title}`);
  };

  // Generate trending topics
  const generateTrendingTopics = () => {
    const mockTopics: TrendingTopic[] = [
      {
        id: 'trend_1',
        keyword: 'الذكاء الاصطناعي',
        volume: 15420,
        growth: 23.5,
        category: 'تقنية',
        relatedTopics: ['تقنية', 'ابتكار', 'مستقبل'],
        timestamp: new Date()
      },
      {
        id: 'trend_2',
        keyword: 'كأس العالم',
        volume: 8932,
        growth: -12.3,
        category: 'رياضة',
        relatedTopics: ['رياضة', 'كرة قدم', 'بطولة'],
        timestamp: new Date()
      },
      {
        id: 'trend_3',
        keyword: 'أسعار النفط',
        volume: 5647,
        growth: 8.7,
        category: 'اقتصاد',
        relatedTopics: ['اقتصاد', 'نفط', 'أسعار'],
        timestamp: new Date()
      }
    ];

    setTrendingTopics(mockTopics);
    toast.success('تم تحديث الترندات');
  };

  // Generate social media posts
  const aggregateSocialMedia = () => {
    const mockPosts: SocialMediaPost[] = Array.from({ length: 6 }, (_, i) => ({
      id: `social_${Date.now()}_${i}`,
      platform: ['twitter', 'facebook', 'instagram', 'linkedin'][Math.floor(Math.random() * 4)] as any,
      content: `منشور رقم ${i + 1} من وسائل التواصل الاجتماعي حول موضوع مهم`,
      author: `مستخدم ${i + 1}`,
      engagement: {
        likes: Math.floor(Math.random() * 1000),
        shares: Math.floor(Math.random() * 500),
        comments: Math.floor(Math.random() * 200)
      },
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      hashtags: ['#سبق', '#أخبار', '#السعودية'],
      mentions: ['@SabqNews'],
      isRelevant: Math.random() > 0.3
    }));

    setSocialPosts(mockPosts);
    toast.success('تم جلب منشورات وسائل التواصل');
  };

  const getStatusIcon = (status: NewsSource['status']) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'syncing': return <Refresh className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getReliabilityColor = (reliability: NewsSource['reliability']) => {
    switch (reliability) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
    }
  };

  const filteredArticles = selectedCategory === 'all' 
    ? externalArticles 
    : externalArticles.filter(a => a.category === selectedCategory);

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">مجمع الأخبار الخارجية</h1>
          <p className="text-muted-foreground">جلب وتجميع الأخبار من المصادر الخارجية ووسائل التواصل</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => aggregateNews()} disabled={isAggregating} className="gap-2">
            <Refresh className={`h-4 w-4 ${isAggregating ? 'animate-spin' : ''}`} />
            جلب الأخبار
          </Button>
          <Button onClick={generateTrendingTopics} variant="outline" className="gap-2">
            <TrendUp className="h-4 w-4" />
            تحديث الترندات
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sources" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sources">المصادر</TabsTrigger>
          <TabsTrigger value="articles">الأخبار المجمعة</TabsTrigger>
          <TabsTrigger value="trends">الترندات</TabsTrigger>
          <TabsTrigger value="social">وسائل التواصل</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                مصادر الأخبار ({newsSources.filter(s => s.isActive).length} نشط)
              </CardTitle>
              <CardDescription>إدارة مصادر الأخبار الخارجية</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {newsSources.map((source) => (
                <Card key={source.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(source.status)}
                        <span className="font-medium">{source.name}</span>
                      </div>
                      <Badge variant="outline">{source.category}</Badge>
                      <Badge variant="outline" className={getReliabilityColor(source.reliability)}>
                        {source.reliability === 'high' ? 'موثوق عالي' : 
                         source.reliability === 'medium' ? 'موثوق متوسط' : 'موثوق منخفض'}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={source.isActive}
                        onCheckedChange={(checked) => {
                          setNewsSources(current => 
                            current.map(s => 
                              s.id === source.id 
                                ? { ...s, isActive: checked }
                                : s
                            )
                          );
                        }}
                      />
                      <Button
                        size="sm"
                        onClick={() => aggregateNews(source.id)}
                        disabled={isAggregating || !source.isActive}
                        className="gap-1"
                      >
                        <Refresh className="h-3 w-3" />
                        مزامنة
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">الرابط:</span>
                      <p className="truncate">{source.url}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">عدد المقالات:</span>
                      <p>{source.articleCount}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">آخر مزامنة:</span>
                      <p>{source.lastSync ? safeTimeFormat(source.lastSync, 'ar-SA') : 'غير متاح'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">اللغة:</span>
                      <p>{source.language === 'ar' ? 'العربية' : 'الإنجليزية'}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Newspaper className="h-5 w-5" />
                الأخبار المجمعة ({filteredArticles.length})
              </CardTitle>
              <CardDescription>
                الأخبار المجمعة من المصادر الخارجية
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع التصنيفات</SelectItem>
                    <SelectItem value="عام">عام</SelectItem>
                    <SelectItem value="دولي">دولي</SelectItem>
                    <SelectItem value="رياضة">رياضة</SelectItem>
                    <SelectItem value="تقنية">تقنية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {filteredArticles.slice(0, 10).map((article) => (
                  <Card key={article.id} className="p-4">
                    <div className="flex gap-4">
                      {article.imageUrl && (
                        <img 
                          src={article.imageUrl} 
                          alt={article.title}
                          className="w-24 h-18 object-cover rounded"
                        />
                      )}
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <h3 className="font-medium line-clamp-2">{article.title}</h3>
                          <div className="flex gap-2">
                            {!article.isImported && (
                              <Button
                                size="sm"
                                onClick={() => importArticle(article)}
                                className="gap-1"
                              >
                                <Database className="h-3 w-3" />
                                استيراد
                              </Button>
                            )}
                            {article.isImported && (
                              <Badge variant="outline" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                مستورد
                              </Badge>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {article.excerpt}
                        </p>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{article.source}</span>
                          <span>{article.author}</span>
                          <span>{article.readingTime} دقائق قراءة</span>
                          <span>{safeDateFormat(article.publishedAt, 'ar-SA')}</span>
                          <Badge variant="outline" className={`text-xs ${
                            article.sentiment === 'positive' ? 'text-green-600' :
                            article.sentiment === 'negative' ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {article.sentiment === 'positive' ? 'إيجابي' :
                             article.sentiment === 'negative' ? 'سلبي' : 'محايد'}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {article.tags.slice(0, 3).map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendUp className="h-5 w-5" />
                الموضوعات الرائجة
              </CardTitle>
              <CardDescription>الموضوعات الأكثر تداولاً حالياً</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingTopics.map((topic) => (
                  <Card key={topic.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">{topic.keyword}</h3>
                      <Badge variant={topic.growth > 0 ? 'default' : 'destructive'}>
                        {topic.growth > 0 ? '+' : ''}{topic.growth.toFixed(1)}%
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">حجم النقاش:</span>
                        <span className="font-medium">{topic.volume.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">التصنيف:</span>
                        <Badge variant="outline">{topic.category}</Badge>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground">مواضيع ذات صلة:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {topic.relatedTopics.map((related, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {related}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social" className="space-y-6">
          <div className="flex gap-2 mb-4">
            <Button onClick={aggregateSocialMedia} className="gap-2">
              <Users className="h-4 w-4" />
              جلب المنشورات
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                منشورات وسائل التواصل ({socialPosts.length})
              </CardTitle>
              <CardDescription>المنشورات ذات الصلة من وسائل التواصل الاجتماعي</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {socialPosts.slice(0, 8).map((post) => (
                <Card key={post.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{post.platform}</Badge>
                      <span className="text-sm font-medium">{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {post.isRelevant && (
                        <Badge variant="default" className="text-xs">ذو صلة</Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {post.timestamp ? safeTimeFormat(post.timestamp, 'ar-SA') : 'غير متاح'}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm mb-3">{post.content}</p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex gap-4">
                      <span>👍 {post.engagement.likes}</span>
                      <span>🔄 {post.engagement.shares}</span>
                      <span>💬 {post.engagement.comments}</span>
                    </div>
                    
                    <div className="flex gap-1">
                      {post.hashtags.slice(0, 2).map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Database className="h-4 w-4 text-primary" />
                <h3 className="font-medium">إجمالي المصادر</h3>
              </div>
              <p className="text-2xl font-bold">{newsSources.length}</p>
              <p className="text-xs text-muted-foreground">
                {newsSources.filter(s => s.isActive).length} نشط
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Newspaper className="h-4 w-4 text-primary" />
                <h3 className="font-medium">مقالات مجمعة</h3>
              </div>
              <p className="text-2xl font-bold">{externalArticles.length}</p>
              <p className="text-xs text-muted-foreground">
                {externalArticles.filter(a => a.isImported).length} مستورد
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendUp className="h-4 w-4 text-primary" />
                <h3 className="font-medium">ترندات نشطة</h3>
              </div>
              <p className="text-2xl font-bold">{trendingTopics.length}</p>
              <p className="text-xs text-muted-foreground">
                {trendingTopics.filter(t => t.growth > 0).length} في نمو
              </p>
            </Card>

            <Card className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4 text-primary" />
                <h3 className="font-medium">منشورات اجتماعية</h3>
              </div>
              <p className="text-2xl font-bold">{socialPosts.length}</p>
              <p className="text-xs text-muted-foreground">
                {socialPosts.filter(p => p.isRelevant).length} ذو صلة
              </p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}