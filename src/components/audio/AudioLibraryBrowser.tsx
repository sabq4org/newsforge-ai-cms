import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Play,
  Pause,
  Stop,
  Download,
  Upload,
  VolumeHigh,
  VolumeLow,
  VolumeX,
  MusicNote,
  MusicNotes,
  SpeakerHigh,
  SpeakerLow,
  SpeakerX,
  Equalizer,
  Waveform,
  Clock,
  Trash,
  Plus,
  X,
  FloppyDisk,
  FolderOpen,
  CloudArrowDown,
  Headphones,
  Shuffle,
  Repeat,
  SkipForward,
  SkipBack,
  DotsThree,
  Heart,
  Star,
  Bookmark,
  Share,
  Tag,
  Timer,
  MagnifyingGlass,
  Funnel,
  SortAscending,
  GridFour,
  List,
  FileAudio,
  Microphone,
  Record,
  Waveform as WaveformIcon
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface BackgroundMusic {
  id: string;
  name: string;
  nameEn: string;
  category: 'intro' | 'background' | 'transition' | 'outro' | 'ambient' | 'news' | 'tech' | 'corporate';
  duration: number;
  bpm?: number;
  key?: string;
  mood: 'calm' | 'energetic' | 'professional' | 'warm' | 'serious' | 'uplifting' | 'dramatic';
  tags: string[];
  url?: string;
  preview_url?: string;
  volume_recommendation: number;
  fade_in_recommendation: number;
  fade_out_recommendation: number;
  loop_point?: number;
  suitable_for: string[];
  description: string;
  license: 'free' | 'premium' | 'custom';
  artist?: string;
  created_at: Date;
  usage_count: number;
  rating: number;
  is_favorite: boolean;
  is_royalty_free: boolean;
}

interface SoundEffect {
  id: string;
  name: string;
  nameEn: string;
  category: 'notification' | 'transition' | 'emphasis' | 'environment' | 'mechanical' | 'nature' | 'digital';
  duration: number;
  tags: string[];
  url?: string;
  preview_url?: string;
  description: string;
  use_cases: string[];
  volume_recommendation: number;
  is_loop: boolean;
  fade_settings?: {
    in: number;
    out: number;
  };
}

interface AudioLibraryProps {
  onMusicSelect: (music: BackgroundMusic) => void;
  onEffectSelect: (effect: SoundEffect) => void;
  selectedCategory?: string;
  searchQuery?: string;
}

// Sample background music library
const BACKGROUND_MUSIC_LIBRARY: BackgroundMusic[] = [
  {
    id: 'news_intro_1',
    name: 'مقدمة إخبارية كلاسيكية',
    nameEn: 'Classic News Intro',
    category: 'intro',
    duration: 15,
    bpm: 120,
    key: 'C Major',
    mood: 'professional',
    tags: ['أخبار', 'كلاسيكي', 'احترافي', 'رسمي'],
    volume_recommendation: 0.4,
    fade_in_recommendation: 2,
    fade_out_recommendation: 3,
    suitable_for: ['النشرات الإخبارية', 'التقارير الرسمية', 'المقابلات'],
    description: 'موسيقى مقدمة احترافية مناسبة للنشرات الإخبارية والبرامج الرسمية',
    license: 'free',
    artist: 'Sabq Audio Library',
    created_at: new Date(),
    usage_count: 245,
    rating: 4.8,
    is_favorite: true,
    is_royalty_free: true
  },
  {
    id: 'soft_ambient_1',
    name: 'أجواء هادئة',
    nameEn: 'Soft Ambient',
    category: 'background',
    duration: 180,
    bpm: 80,
    mood: 'calm',
    tags: ['هادئ', 'خلفية', 'استرخاء', 'تأمل'],
    volume_recommendation: 0.2,
    fade_in_recommendation: 5,
    fade_out_recommendation: 5,
    loop_point: 60,
    suitable_for: ['البودكاست الثقافي', 'المحتوى التعليمي', 'الحوارات الهادئة'],
    description: 'موسيقى خلفية هادئة مثالية للمحتوى الثقافي والتعليمي',
    license: 'free',
    created_at: new Date(),
    usage_count: 156,
    rating: 4.6,
    is_favorite: false,
    is_royalty_free: true
  },
  {
    id: 'tech_upbeat_1',
    name: 'إيقاع تقني حيوي',
    nameEn: 'Tech Upbeat',
    category: 'background',
    duration: 240,
    bpm: 128,
    mood: 'energetic',
    tags: ['تقني', 'حيوي', 'عصري', 'تكنولوجيا'],
    volume_recommendation: 0.3,
    fade_in_recommendation: 3,
    fade_out_recommendation: 4,
    loop_point: 80,
    suitable_for: ['أخبار التكنولوجيا', 'البودكاست التقني', 'المراجعات'],
    description: 'موسيقى حيوية مناسبة للمحتوى التقني والتكنولوجي',
    license: 'premium',
    artist: 'Digital Beats Studio',
    created_at: new Date(),
    usage_count: 89,
    rating: 4.7,
    is_favorite: false,
    is_royalty_free: false
  },
  {
    id: 'corporate_serious_1',
    name: 'جدي مؤسسي',
    nameEn: 'Corporate Serious',
    category: 'background',
    duration: 200,
    bpm: 110,
    mood: 'serious',
    tags: ['جدي', 'مؤسسي', 'رسمي', 'أعمال'],
    volume_recommendation: 0.25,
    fade_in_recommendation: 4,
    fade_out_recommendation: 4,
    suitable_for: ['التقارير الاقتصادية', 'أخبار الأعمال', 'المؤتمرات'],
    description: 'موسيقى جدية مناسبة للمحتوى المؤسسي والاقتصادي',
    license: 'free',
    created_at: new Date(),
    usage_count: 123,
    rating: 4.5,
    is_favorite: true,
    is_royalty_free: true
  },
  {
    id: 'warm_outro_1',
    name: 'خاتمة دافئة',
    nameEn: 'Warm Outro',
    category: 'outro',
    duration: 20,
    mood: 'warm',
    tags: ['دافئ', 'خاتمة', 'إيجابي', 'مريح'],
    volume_recommendation: 0.35,
    fade_in_recommendation: 2,
    fade_out_recommendation: 5,
    suitable_for: ['خاتمة البودكاست', 'نهاية البرامج', 'الشكر والتوديع'],
    description: 'موسيقى خاتمة دافئة تترك انطباعاً إيجابياً',
    license: 'free',
    created_at: new Date(),
    usage_count: 198,
    rating: 4.9,
    is_favorite: true,
    is_royalty_free: true
  }
];

// Sample sound effects library
const SOUND_EFFECTS_LIBRARY: SoundEffect[] = [
  {
    id: 'notification_bell',
    name: 'جرس التنبيه',
    nameEn: 'Notification Bell',
    category: 'notification',
    duration: 2,
    tags: ['تنبيه', 'جرس', 'إشعار'],
    description: 'صوت جرس لطيف للتنبيهات والإشعارات',
    use_cases: ['بداية قسم جديد', 'تنبيه مهم', 'فاصل إعلاني'],
    volume_recommendation: 0.6,
    is_loop: false
  },
  {
    id: 'page_turn',
    name: 'قلب صفحة',
    nameEn: 'Page Turn',
    category: 'transition',
    duration: 1.5,
    tags: ['انتقال', 'ورق', 'كتاب'],
    description: 'صوت قلب صفحة للانتقال بين المواضيع',
    use_cases: ['انتقال بين المواضيع', 'بداية فقرة جديدة'],
    volume_recommendation: 0.4,
    is_loop: false
  },
  {
    id: 'typewriter_click',
    name: 'نقرة آلة كاتبة',
    nameEn: 'Typewriter Click',
    category: 'mechanical',
    duration: 0.8,
    tags: ['آلة كاتبة', 'نقر', 'كتابة'],
    description: 'صوت نقرة آلة كاتبة كلاسيكية',
    use_cases: ['التأكيد على نقطة', 'إضافة طابع كلاسيكي'],
    volume_recommendation: 0.5,
    is_loop: false
  },
  {
    id: 'digital_beep',
    name: 'صفير رقمي',
    nameEn: 'Digital Beep',
    category: 'digital',
    duration: 1,
    tags: ['رقمي', 'تقني', 'صفير'],
    description: 'صوت صفير رقمي للمحتوى التقني',
    use_cases: ['المحتوى التقني', 'الإحصائيات', 'البيانات'],
    volume_recommendation: 0.7,
    is_loop: false
  },
  {
    id: 'applause_short',
    name: 'تصفيق قصير',
    nameEn: 'Short Applause',
    category: 'emphasis',
    duration: 3,
    tags: ['تصفيق', 'احتفال', 'تقدير'],
    description: 'صوت تصفيق قصير للاحتفال أو التقدير',
    use_cases: ['الإنجازات', 'النجاحات', 'نهاية إيجابية'],
    volume_recommendation: 0.4,
    is_loop: false
  }
];

export function AudioLibraryBrowser({ 
  onMusicSelect, 
  onEffectSelect, 
  selectedCategory,
  searchQuery 
}: AudioLibraryProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('music');
  const [favorites, setFavorites] = useKV<string[]>('sabq-audio-favorites', []);
  const [recentlyUsed, setRecentlyUsed] = useKV<string[]>('sabq-audio-recent', []);
  const [customUploads, setCustomUploads] = useKV<(BackgroundMusic | SoundEffect)[]>('sabq-audio-custom', []);
  
  const [musicFilter, setMusicFilter] = useState({
    category: selectedCategory || 'all',
    mood: 'all',
    license: 'all',
    duration: 'all'
  });
  
  const [effectsFilter, setEffectsFilter] = useState({
    category: 'all',
    duration: 'all'
  });
  
  const [search, setSearch] = useState(searchQuery || '');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [playingPreview, setPlayingPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter and sort music
  const filteredMusic = BACKGROUND_MUSIC_LIBRARY
    .filter(music => {
      if (musicFilter.category !== 'all' && music.category !== musicFilter.category) return false;
      if (musicFilter.mood !== 'all' && music.mood !== musicFilter.mood) return false;
      if (musicFilter.license !== 'all' && music.license !== musicFilter.license) return false;
      if (search && !music.name.toLowerCase().includes(search.toLowerCase()) && 
          !music.nameEn.toLowerCase().includes(search.toLowerCase()) &&
          !music.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating': return b.rating - a.rating;
        case 'usage': return b.usage_count - a.usage_count;
        case 'duration': return a.duration - b.duration;
        case 'name': return a.name.localeCompare(b.name);
        default: return 0;
      }
    });

  // Filter and sort effects
  const filteredEffects = SOUND_EFFECTS_LIBRARY
    .filter(effect => {
      if (effectsFilter.category !== 'all' && effect.category !== effectsFilter.category) return false;
      if (search && !effect.name.toLowerCase().includes(search.toLowerCase()) && 
          !effect.nameEn.toLowerCase().includes(search.toLowerCase()) &&
          !effect.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))) return false;
      return true;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  // Play preview
  const playPreview = async (url: string | undefined, id: string) => {
    if (!url) {
      toast.error('المعاينة غير متاحة');
      return;
    }

    try {
      if (playingPreview === id) {
        // Stop current preview
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        setPlayingPreview(null);
        return;
      }

      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.currentTime = 0;
        
        audioRef.current.addEventListener('ended', () => {
          setPlayingPreview(null);
        });
        
        await audioRef.current.play();
        setPlayingPreview(id);
        toast.success('تشغيل المعاينة');
      }
    } catch (error) {
      console.error('Error playing preview:', error);
      toast.error('حدث خطأ في تشغيل المعاينة');
    }
  };

  // Toggle favorite
  const toggleFavorite = (id: string) => {
    setFavorites(current => {
      if (current.includes(id)) {
        return current.filter(fav => fav !== id);
      } else {
        return [...current, id];
      }
    });
  };

  // Add to recently used
  const addToRecent = (id: string) => {
    setRecentlyUsed(current => {
      const filtered = current.filter(item => item !== id);
      return [id, ...filtered].slice(0, 10);
    });
  };

  // Handle music selection
  const handleMusicSelect = (music: BackgroundMusic) => {
    addToRecent(music.id);
    onMusicSelect(music);
    toast.success(`تم اختيار: ${music.name}`);
  };

  // Handle effect selection
  const handleEffectSelect = (effect: SoundEffect) => {
    addToRecent(effect.id);
    onEffectSelect(effect);
    toast.success(`تم اختيار: ${effect.name}`);
  };

  // Upload custom audio
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith('audio/')) {
          toast.error(`${file.name} ليس ملف صوتي`);
          continue;
        }

        // Create audio object to get duration
        const audio = new Audio();
        const url = URL.createObjectURL(file);
        audio.src = url;

        await new Promise<void>((resolve) => {
          audio.addEventListener('loadedmetadata', () => {
            const customAudio: BackgroundMusic = {
              id: `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
              name: file.name.replace(/\.[^/.]+$/, ''),
              nameEn: file.name.replace(/\.[^/.]+$/, ''),
              category: 'background',
              duration: Math.ceil(audio.duration),
              mood: 'calm',
              tags: ['مخصص', 'مرفوع'],
              url,
              volume_recommendation: 0.5,
              fade_in_recommendation: 2,
              fade_out_recommendation: 2,
              suitable_for: ['محتوى مخصص'],
              description: `ملف صوتي مرفوع: ${file.name}`,
              license: 'custom',
              created_at: new Date(),
              usage_count: 0,
              rating: 5,
              is_favorite: false,
              is_royalty_free: true
            };

            setCustomUploads(current => [...current, customAudio]);
            resolve();
          });
        });

        URL.revokeObjectURL(url);
      }

      toast.success('تم رفع الملفات الصوتية بنجاح');
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('حدث خطأ في رفع الملفات');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'intro': return <Play size={16} />;
      case 'outro': return <Stop size={16} />;
      case 'background': return <MusicNotes size={16} />;
      case 'transition': return <SkipForward size={16} />;
      case 'notification': return <Timer size={16} />;
      case 'emphasis': return <Star size={16} />;
      default: return <MusicNote size={16} />;
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">مكتبة الصوتيات</h2>
          <p className="text-muted-foreground">موسيقى خلفية ومؤثرات صوتية احترافية</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <div className="w-4 h-4 border border-primary border-t-transparent rounded-full animate-spin ml-1" />
            ) : (
              <Upload className="ml-1" size={16} />
            )}
            رفع ملفات
          </Button>
          
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <GridFour size={16} />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlass className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  placeholder="البحث في المكتبة..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">التقييم</SelectItem>
                <SelectItem value="usage">الاستخدام</SelectItem>
                <SelectItem value="duration">المدة</SelectItem>
                <SelectItem value="name">الاسم</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="music">الموسيقى الخلفية</TabsTrigger>
          <TabsTrigger value="effects">المؤثرات الصوتية</TabsTrigger>
          <TabsTrigger value="custom">الملفات المخصصة</TabsTrigger>
        </TabsList>

        {/* Background Music */}
        <TabsContent value="music" className="space-y-4">
          {/* Music Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <Label>الفئة</Label>
                  <Select value={musicFilter.category} onValueChange={(value) => 
                    setMusicFilter(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="intro">مقدمة</SelectItem>
                      <SelectItem value="background">خلفية</SelectItem>
                      <SelectItem value="transition">انتقال</SelectItem>
                      <SelectItem value="outro">خاتمة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>المزاج</Label>
                  <Select value={musicFilter.mood} onValueChange={(value) => 
                    setMusicFilter(prev => ({ ...prev, mood: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="calm">هادئ</SelectItem>
                      <SelectItem value="energetic">حيوي</SelectItem>
                      <SelectItem value="professional">احترافي</SelectItem>
                      <SelectItem value="serious">جدي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>الترخيص</Label>
                  <Select value={musicFilter.license} onValueChange={(value) => 
                    setMusicFilter(prev => ({ ...prev, license: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="free">مجاني</SelectItem>
                      <SelectItem value="premium">مميز</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setMusicFilter({
                      category: 'all',
                      mood: 'all', 
                      license: 'all',
                      duration: 'all'
                    })}
                  >
                    إعادة تعيين
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Music Grid/List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-2'}>
            {filteredMusic.map((music) => (
              <Card 
                key={music.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  playingPreview === music.id ? 'ring-2 ring-primary' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-sm">{music.name}</h3>
                      <p className="text-xs text-muted-foreground">{music.nameEn}</p>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(music.id);
                        }}
                      >
                        <Heart 
                          size={14} 
                          className={favorites.includes(music.id) ? 'fill-red-500 text-red-500' : ''} 
                        />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          playPreview(music.preview_url || music.url, music.id);
                        }}
                      >
                        {playingPreview === music.id ? <Pause size={14} /> : <Play size={14} />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(music.category)}
                        <span>{formatDuration(music.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star size={12} className="fill-yellow-400 text-yellow-400" />
                        <span>{music.rating.toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">{music.category}</Badge>
                      <Badge variant="outline" className="text-xs">{music.mood}</Badge>
                      {music.license === 'premium' && (
                        <Badge variant="secondary" className="text-xs">مميز</Badge>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {music.description}
                    </p>

                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleMusicSelect(music)}
                    >
                      اختيار هذه الموسيقى
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredMusic.length === 0 && (
            <div className="text-center py-12">
              <MusicNote size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">لا توجد نتائج</h3>
              <p className="text-muted-foreground">جرب تغيير معايير البحث أو الفلترة</p>
            </div>
          )}
        </TabsContent>

        {/* Sound Effects */}
        <TabsContent value="effects" className="space-y-4">
          {/* Effects Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>الفئة</Label>
                  <Select value={effectsFilter.category} onValueChange={(value) => 
                    setEffectsFilter(prev => ({ ...prev, category: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="notification">تنبيه</SelectItem>
                      <SelectItem value="transition">انتقال</SelectItem>
                      <SelectItem value="emphasis">تأكيد</SelectItem>
                      <SelectItem value="mechanical">ميكانيكي</SelectItem>
                      <SelectItem value="digital">رقمي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>المدة</Label>
                  <Select value={effectsFilter.duration} onValueChange={(value) => 
                    setEffectsFilter(prev => ({ ...prev, duration: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">الكل</SelectItem>
                      <SelectItem value="short">قصير (&lt; 2 ثانية)</SelectItem>
                      <SelectItem value="medium">متوسط (2-5 ثواني)</SelectItem>
                      <SelectItem value="long">طويل (&gt; 5 ثواني)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => setEffectsFilter({
                      category: 'all',
                      duration: 'all'
                    })}
                  >
                    إعادة تعيين
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Effects Grid/List */}
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-2'}>
            {filteredEffects.map((effect) => (
              <Card key={effect.id} className="cursor-pointer transition-all hover:shadow-md">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm">{effect.name}</h3>
                        <p className="text-xs text-muted-foreground">{effect.nameEn}</p>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          playPreview(effect.preview_url || effect.url, effect.id);
                        }}
                      >
                        {playingPreview === effect.id ? <Pause size={14} /> : <Play size={14} />}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        {getCategoryIcon(effect.category)}
                        <span>{formatDuration(effect.duration)}</span>
                      </div>
                      {effect.is_loop && (
                        <Badge variant="outline" className="text-xs">تكرار</Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1">
                      <Badge variant="outline" className="text-xs">{effect.category}</Badge>
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {effect.description}
                    </p>

                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => handleEffectSelect(effect)}
                    >
                      اختيار هذا التأثير
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEffects.length === 0 && (
            <div className="text-center py-12">
              <SpeakerHigh size={64} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">لا توجد نتائج</h3>
              <p className="text-muted-foreground">جرب تغيير معايير البحث أو الفلترة</p>
            </div>
          )}
        </TabsContent>

        {/* Custom Uploads */}
        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="space-y-4">
                <div>
                  <Upload size={48} className="mx-auto text-muted-foreground mb-2" />
                  <h3 className="font-semibold">ارفع ملفاتك الصوتية</h3>
                  <p className="text-sm text-muted-foreground">
                    يدعم MP3, WAV, AAC حتى 50 ميجابايت
                  </p>
                </div>
                
                <Button onClick={() => fileInputRef.current?.click()}>
                  <Plus className="ml-2" size={16} />
                  اختيار ملفات
                </Button>
              </div>
            </CardContent>
          </Card>

          {customUploads.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {customUploads.map((audio) => (
                <Card key={audio.id} className="cursor-pointer transition-all hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm">{audio.name}</h3>
                          <Badge variant="secondary" className="text-xs mt-1">مخصص</Badge>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            playPreview(audio.url, audio.id);
                          }}
                        >
                          {playingPreview === audio.id ? <Pause size={14} /> : <Play size={14} />}
                        </Button>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        المدة: {formatDuration(audio.duration)}
                      </div>

                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => 'category' in audio ? handleMusicSelect(audio) : handleEffectSelect(audio)}
                      >
                        استخدام هذا الملف
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Hidden audio player */}
      <audio ref={audioRef} />
    </div>
  );
}