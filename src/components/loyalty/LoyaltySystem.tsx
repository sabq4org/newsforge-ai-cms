import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy,
  Star,
  Gift,
  Target,
  TrendUp,
  Users,
  Clock,
  Heart,
  Share,
  BookOpen,
  Crown,
  Medal,
  Flame,
  Lightning,
  Coffee,
  Sunrise,
  Moon,
  Eye,
  MessageCircle,
  ThumbsUp,
  Calendar,
  CheckCircle
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { Article } from '@/types';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  preferences: {
    categories: string[];
    timeSlots: string[];
    contentTypes: string[];
  };
  readingStats: {
    totalArticles: number;
    totalReadTime: number;
    avgSessionTime: number;
    favoriteCategory: string;
    readingStreak: number;
    lastActiveDate: Date;
  };
  engagementScore: number;
  loyaltyTier: 'bronze' | 'silver' | 'gold' | 'platinum';
  badges: Badge[];
  dailyMeal: {
    articles: Article[];
    generatedAt: Date;
    consumed: boolean;
  };
}

interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'reading' | 'engagement' | 'streak' | 'special';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt: Date;
  progress?: number;
  maxProgress?: number;
}

interface DailyMeal {
  preferred: Article[];
  opinion: Article;
  discovery: Article;
  trending: Article[];
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string;
  type: 'feature' | 'content' | 'cosmetic';
  cost: number;
  available: boolean;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

const LOYALTY_TIERS = {
  bronze: { name: 'برونزي', minScore: 0, color: '#cd7f32', benefits: ['قراءة أساسية'] },
  silver: { name: 'فضي', minScore: 1000, color: '#c0c0c0', benefits: ['إزالة الإعلانات الجزئية', 'وجبة إخبارية يومية'] },
  gold: { name: 'ذهبي', minScore: 5000, color: '#ffd700', benefits: ['إزالة جميع الإعلانات', 'نشرة مخصصة', 'وصول مبكر'] },
  platinum: { name: 'بلاتيني', minScore: 15000, color: '#e5e4e2', benefits: ['جميع الميزات', 'محتوى حصري', 'دعم أولوية'] }
};

const AVAILABLE_BADGES = [
  { id: 'early_bird', name: 'الطائر المبكر', description: 'قراءة في الصباح الباكر', icon: 'sunrise', category: 'reading', rarity: 'common' },
  { id: 'night_owl', name: 'بومة الليل', description: 'قراءة في وقت متأخر', icon: 'moon', category: 'reading', rarity: 'common' },
  { id: 'coffee_reader', name: 'قارئ القهوة', description: 'قراءة في استراحة الغداء', icon: 'coffee', category: 'reading', rarity: 'common' },
  { id: 'streak_7', name: 'أسبوع متواصل', description: '7 أيام قراءة متتالية', icon: 'flame', category: 'streak', rarity: 'rare' },
  { id: 'streak_30', name: 'شهر متواصل', description: '30 يوم قراءة متتالية', icon: 'lightning', category: 'streak', rarity: 'epic' },
  { id: 'social_sharer', name: 'المشارك النشط', description: 'مشاركة 50 مقال', icon: 'share', category: 'engagement', rarity: 'rare' },
  { id: 'opinion_seeker', name: 'باحث الآراء', description: 'قراءة 100 مقال رأي', icon: 'message-circle', category: 'reading', rarity: 'epic' },
  { id: 'news_addict', name: 'مدمن الأخبار', description: 'قراءة 1000 مقال', icon: 'book-open', category: 'reading', rarity: 'legendary' }
];

const LOYALTY_REWARDS: LoyaltyReward[] = [
  { id: 'ad_free', name: 'إزالة الإعلانات', description: 'تجربة قراءة بدون إعلانات', type: 'feature', cost: 500, available: true, tier: 'silver' },
  { id: 'custom_newsletter', name: 'نشرة مخصصة', description: 'نشرة بريدية حسب اهتماماتك', type: 'content', cost: 1000, available: true, tier: 'gold' },
  { id: 'early_access', name: 'وصول مبكر', description: 'اطلع على الأخبار قبل النشر العام', type: 'feature', cost: 2000, available: true, tier: 'gold' },
  { id: 'exclusive_content', name: 'محتوى حصري', description: 'مقالات وتحليلات حصرية', type: 'content', cost: 5000, available: true, tier: 'platinum' }
];

interface LoyaltySystemProps {
  articles?: Article[];
  currentUser?: any;
}

export function LoyaltySystem({ articles = [], currentUser }: LoyaltySystemProps) {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useKV<UserProfile>(`user-profile-${user?.id}`, {
    id: user?.id || '',
    preferences: {
      categories: [],
      timeSlots: ['morning'],
      contentTypes: ['news', 'opinion']
    },
    readingStats: {
      totalArticles: 0,
      totalReadTime: 0,
      avgSessionTime: 0,
      favoriteCategory: '',
      readingStreak: 0,
      lastActiveDate: new Date()
    },
    engagementScore: 0,
    loyaltyTier: 'bronze',
    badges: [],
    dailyMeal: {
      articles: [],
      generatedAt: new Date(),
      consumed: false
    }
  });

  const [dailyMeal, setDailyMeal] = useState<DailyMeal | null>(null);
  const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Calculate current tier based on engagement score
  const getCurrentTier = (score: number): keyof typeof LOYALTY_TIERS => {
    if (score >= LOYALTY_TIERS.platinum.minScore) return 'platinum';
    if (score >= LOYALTY_TIERS.gold.minScore) return 'gold';
    if (score >= LOYALTY_TIERS.silver.minScore) return 'silver';
    return 'bronze';
  };

  // Generate daily news meal
  const generateDailyMeal = async () => {
    if (!user) return;

    setIsGeneratingMeal(true);
    try {
      const prompt = spark.llmPrompt`Based on this user's reading preferences and history, select 4 articles for their daily news meal:

User Preferences:
- Favorite categories: ${userProfile.preferences.categories.join(', ') || 'general'}
- Reading time: ${userProfile.preferences.timeSlots.join(', ')}
- Content types: ${userProfile.preferences.contentTypes.join(', ')}

Available Articles:
${articles.slice(0, 20).map(a => `- ${a.title} (${a.category?.name}) - ${a.excerpt?.substring(0, 100)}...`).join('\n')}

Select:
1. Three articles matching user preferences (preferred)
2. One opinion/analysis piece (opinion)  
3. One article from a different category for discovery (discovery)

Return article IDs in this format:
{
  "preferred": ["id1", "id2", "id3"],
  "opinion": "id4", 
  "discovery": "id5"
}`;

      const result = await spark.llm(prompt, 'gpt-4o-mini', true);
      const mealData = JSON.parse(result);

      const meal: DailyMeal = {
        preferred: mealData.preferred.map((id: string) => articles.find(a => a.id === id)).filter(Boolean),
        opinion: articles.find(a => a.id === mealData.opinion)!,
        discovery: articles.find(a => a.id === mealData.discovery)!,
        trending: articles.slice(0, 3) // Mock trending
      };

      setDailyMeal(meal);
      
      // Update user profile
      setUserProfile(prev => ({
        ...prev,
        dailyMeal: {
          articles: [...meal.preferred, meal.opinion, meal.discovery],
          generatedAt: new Date(),
          consumed: false
        }
      }));

      toast.success('تم إعداد وجبتك الإخبارية اليومية!');
    } catch (error) {
      console.error('Error generating daily meal:', error);
      toast.error('حدث خطأ في إعداد الوجبة الإخبارية');
    } finally {
      setIsGeneratingMeal(false);
    }
  };

  // Award points for user actions
  const awardPoints = (action: string, points: number) => {
    setUserProfile(prev => {
      const newScore = prev.engagementScore + points;
      const newTier = getCurrentTier(newScore);
      
      // Check for tier upgrade
      if (newTier !== prev.loyaltyTier) {
        toast.success(`تهانينا! لقد وصلت إلى مستوى ${LOYALTY_TIERS[newTier].name}!`);
      }

      return {
        ...prev,
        engagementScore: newScore,
        loyaltyTier: newTier
      };
    });
  };

  // Check and award badges
  const checkBadges = () => {
    const newBadges: Badge[] = [];
    
    AVAILABLE_BADGES.forEach(badgeTemplate => {
      const hasBadge = userProfile.badges.some(b => b.id === badgeTemplate.id);
      if (hasBadge) return;

      let shouldAward = false;

      switch (badgeTemplate.id) {
        case 'early_bird':
          shouldAward = new Date().getHours() < 9;
          break;
        case 'night_owl':
          shouldAward = new Date().getHours() > 22;
          break;
        case 'coffee_reader':
          shouldAward = new Date().getHours() >= 12 && new Date().getHours() <= 14;
          break;
        case 'streak_7':
          shouldAward = userProfile.readingStats.readingStreak >= 7;
          break;
        case 'streak_30':
          shouldAward = userProfile.readingStats.readingStreak >= 30;
          break;
        case 'news_addict':
          shouldAward = userProfile.readingStats.totalArticles >= 1000;
          break;
      }

      if (shouldAward) {
        newBadges.push({
          id: badgeTemplate.id,
          name: badgeTemplate.name,
          description: badgeTemplate.description,
          icon: badgeTemplate.icon,
          category: badgeTemplate.category as any,
          rarity: badgeTemplate.rarity as any,
          unlockedAt: new Date()
        });
      }
    });

    if (newBadges.length > 0) {
      setUserProfile(prev => ({
        ...prev,
        badges: [...prev.badges, ...newBadges]
      }));
      
      newBadges.forEach(badge => {
        toast.success(`حصلت على شارة جديدة: ${badge.name}!`);
      });
    }
  };

  // Simulate reading an article
  const markArticleAsRead = (articleId: string) => {
    setUserProfile(prev => ({
      ...prev,
      readingStats: {
        ...prev.readingStats,
        totalArticles: prev.readingStats.totalArticles + 1,
        totalReadTime: prev.readingStats.totalReadTime + 180, // 3 minutes average
        lastActiveDate: new Date()
      }
    }));
    
    awardPoints('article_read', 10);
    checkBadges();
  };

  // Get tier progress
  const getTierProgress = () => {
    const currentTier = userProfile.loyaltyTier;
    const currentScore = userProfile.engagementScore;
    
    const tierKeys = Object.keys(LOYALTY_TIERS) as (keyof typeof LOYALTY_TIERS)[];
    const currentIndex = tierKeys.indexOf(currentTier);
    
    if (currentIndex === tierKeys.length - 1) {
      return { progress: 100, nextTier: null, pointsNeeded: 0 };
    }
    
    const nextTier = tierKeys[currentIndex + 1];
    const currentTierMin = LOYALTY_TIERS[currentTier].minScore;
    const nextTierMin = LOYALTY_TIERS[nextTier].minScore;
    
    const progress = ((currentScore - currentTierMin) / (nextTierMin - currentTierMin)) * 100;
    const pointsNeeded = nextTierMin - currentScore;
    
    return { progress: Math.min(progress, 100), nextTier, pointsNeeded };
  };

  const tierProgress = getTierProgress();
  const currentTierInfo = LOYALTY_TIERS[userProfile.loyaltyTier];

  useEffect(() => {
    // Generate daily meal if needed
    const lastGenerated = new Date(userProfile.dailyMeal.generatedAt);
    const today = new Date();
    
    if (lastGenerated.toDateString() !== today.toDateString()) {
      generateDailyMeal();
    }
  }, []);

  const getBadgeIcon = (iconName: string) => {
    const icons: Record<string, any> = {
      sunrise: Sunrise,
      moon: Moon,
      coffee: Coffee,
      flame: Flame,
      lightning: Lightning,
      share: Share,
      'message-circle': MessageCircle,
      'book-open': BookOpen
    };
    const IconComponent = icons[iconName] || Trophy;
    return <IconComponent size={16} />;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام الولاء والمكافآت</h1>
          <p className="text-muted-foreground">اكسب نقاط واحصل على مكافآت من خلال القراءة والتفاعل</p>
        </div>
      </div>

      {/* User Stats Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white`} style={{ backgroundColor: currentTierInfo.color }}>
                <Crown size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{user?.login}</h2>
                <p className="text-muted-foreground">مستوى {currentTierInfo.name}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold">{userProfile.engagementScore.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">نقطة ولاء</p>
            </div>
          </div>

          {tierProgress.nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>التقدم إلى {LOYALTY_TIERS[tierProgress.nextTier].name}</span>
                <span>{tierProgress.pointsNeeded} نقطة متبقية</span>
              </div>
              <Progress value={tierProgress.progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">لوحة التحكم</TabsTrigger>
          <TabsTrigger value="meal">الوجبة اليومية</TabsTrigger>
          <TabsTrigger value="badges">الشارات</TabsTrigger>
          <TabsTrigger value="rewards">المكافآت</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Reading Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen size={20} />
                  إحصائيات القراءة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>المقالات المقروءة</span>
                  <span className="font-bold">{userProfile.readingStats.totalArticles}</span>
                </div>
                <div className="flex justify-between">
                  <span>وقت القراءة الإجمالي</span>
                  <span className="font-bold">{Math.round(userProfile.readingStats.totalReadTime / 60)} ساعة</span>
                </div>
                <div className="flex justify-between">
                  <span>المتتالية الحالية</span>
                  <span className="font-bold flex items-center gap-1">
                    <Flame size={16} className="text-orange-500" />
                    {userProfile.readingStats.readingStreak} يوم
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Badges */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Medal size={20} />
                  الشارات الحديثة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {userProfile.badges.slice(-3).map(badge => (
                    <div key={badge.id} className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${getRarityColor(badge.rarity)}`}>
                        {getBadgeIcon(badge.icon)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{badge.name}</p>
                        <p className="text-xs text-muted-foreground">{badge.description}</p>
                      </div>
                    </div>
                  ))}
                  
                  {userProfile.badges.length === 0 && (
                    <p className="text-muted-foreground text-sm">لا توجد شارات بعد</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tier Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift size={20} />
                  مزايا المستوى
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {currentTierInfo.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-500" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Daily Meal Tab */}
        <TabsContent value="meal" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Coffee size={20} />
                    وجبتك الإخبارية اليومية
                  </CardTitle>
                  <CardDescription>
                    مقالات مختارة خصيصاً لك بناء على اهتماماتك
                  </CardDescription>
                </div>
                
                <Button onClick={generateDailyMeal} disabled={isGeneratingMeal}>
                  {isGeneratingMeal ? 'جاري التحضير...' : 'تحديث الوجبة'}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {dailyMeal ? (
                <div className="space-y-6">
                  {/* Preferred Articles */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Heart size={18} className="text-red-500" />
                      المقالات المفضلة لك
                    </h3>
                    <div className="grid gap-3">
                      {dailyMeal.preferred.map(article => (
                        <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <h4 className="font-medium">{article.title}</h4>
                            <p className="text-sm text-muted-foreground">{article.category?.name}</p>
                          </div>
                          <Button size="sm" onClick={() => markArticleAsRead(article.id)}>
                            قراءة
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Opinion Article */}
                  {dailyMeal.opinion && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <MessageCircle size={18} className="text-blue-500" />
                        مقال رأي مختار
                      </h3>
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-medium">{dailyMeal.opinion.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{dailyMeal.opinion.excerpt}</p>
                        <Button size="sm" className="mt-2" onClick={() => markArticleAsRead(dailyMeal.opinion.id)}>
                          قراءة
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Discovery Article */}
                  {dailyMeal.discovery && (
                    <div>
                      <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Eye size={18} className="text-purple-500" />
                        اكتشف شيئاً جديداً
                      </h3>
                      <div className="p-3 border rounded-lg">
                        <h4 className="font-medium">{dailyMeal.discovery.title}</h4>
                        <Badge variant="outline" className="mt-1">{dailyMeal.discovery.category?.name}</Badge>
                        <p className="text-sm text-muted-foreground mt-2">{dailyMeal.discovery.excerpt}</p>
                        <Button size="sm" className="mt-2" onClick={() => markArticleAsRead(dailyMeal.discovery.id)}>
                          قراءة
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Coffee size={48} className="mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">اضغط على "تحديث الوجبة" لإعداد وجبتك الإخبارية</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {AVAILABLE_BADGES.map(badgeTemplate => {
              const earned = userProfile.badges.find(b => b.id === badgeTemplate.id);
              
              return (
                <Card key={badgeTemplate.id} className={`text-center ${earned ? '' : 'opacity-50'}`}>
                  <CardContent className="p-4">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-white mb-3 ${getRarityColor(badgeTemplate.rarity)}`}>
                      {getBadgeIcon(badgeTemplate.icon)}
                    </div>
                    
                    <h3 className="font-medium mb-1">{badgeTemplate.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{badgeTemplate.description}</p>
                    
                    <Badge variant={earned ? 'default' : 'outline'} className="text-xs">
                      {earned ? 'محصل عليها' : badgeTemplate.rarity}
                    </Badge>
                    
                    {earned && earned.unlockedAt && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(earned.unlockedAt).toLocaleDateString('ar-SA')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid gap-4">
            {LOYALTY_REWARDS.map(reward => {
              const canAfford = userProfile.engagementScore >= reward.cost;
              const tierUnlocked = LOYALTY_TIERS[userProfile.loyaltyTier].minScore >= LOYALTY_TIERS[reward.tier].minScore;
              
              return (
                <Card key={reward.id} className={`${canAfford && tierUnlocked ? '' : 'opacity-50'}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <Gift size={24} className="text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">{reward.name}</h3>
                          <p className="text-sm text-muted-foreground">{reward.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">{reward.cost} نقطة</Badge>
                            <Badge variant="outline">{LOYALTY_TIERS[reward.tier].name}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <Button 
                        disabled={!canAfford || !tierUnlocked}
                        variant={canAfford && tierUnlocked ? 'default' : 'outline'}
                      >
                        {canAfford && tierUnlocked ? 'استبدال' : 'غير متاح'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}