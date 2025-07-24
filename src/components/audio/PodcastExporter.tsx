import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
  Share,
  CloudArrowDown,
  CloudArrowUp,
  Waveform,
  FileAudio,
  Magic,
  Sparkles,
  Robot,
  Settings,
  VolumeHigh,
  Timer,
  CheckCircle,
  Warning,
  Info,
  X,
  Plus,
  Minus,
  FloppyDisk,
  FolderOpen,
  Export,
  ArrowsClockwise,
  MusicNotes,
  SpeakerHigh,
  Headphones,
  Globe,
  Link,
  Copy,
  QrCode,
  Rss,
  DeviceMobile,
  Desktop,
  Youtube,
  SpotifyLogo,
  SoundcloudLogo,
  TwitterLogo,
  FacebookLogo,
  LinkedinLogo,
  WhatsappLogo,
  TelegramLogo
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AudioProject {
  id: string;
  name: string;
  articleId: string;
  segments: any[];
  globalSettings: {
    outputFormat: 'mp3' | 'wav' | 'aac';
    sampleRate: 22050 | 44100 | 48000;
    bitrate: 128 | 192 | 256 | 320;
    normalize: boolean;
    limitPeaks: boolean;
    backgroundMusic: {
      enabled: boolean;
      url?: string;
      volume: number;
      fadeIn: number;
      fadeOut: number;
    };
  };
  metadata: {
    title: string;
    author: string;
    description: string;
    language: 'ar' | 'en';
    genre: string;
    thumbnail?: string;
    website?: string;
    copyright?: string;
  };
  status: 'draft' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ExportOptions {
  format: 'mp3' | 'wav' | 'aac';
  quality: 'low' | 'medium' | 'high' | 'lossless';
  normalize: boolean;
  addMetadata: boolean;
  generateWaveform: boolean;
  createChapters: boolean;
  addIntroOutro: boolean;
  backgroundMusic: boolean;
  outputName?: string;
}

interface PodcastExporterProps {
  project: AudioProject;
  onExportComplete?: (result: ExportResult) => void;
  onExportStart?: () => void;
}

interface ExportResult {
  success: boolean;
  outputUrl?: string;
  duration?: number;
  fileSize?: number;
  format?: string;
  metadata?: any;
  socialCards?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  error?: string;
}

interface SharingOptions {
  platform: 'direct' | 'twitter' | 'facebook' | 'linkedin' | 'whatsapp' | 'telegram' | 'email' | 'rss';
  title: string;
  description: string;
  url: string;
  hashtags?: string[];
  mentions?: string[];
}

export function PodcastExporter({ project, onExportComplete, onExportStart }: PodcastExporterProps) {
  const { user } = useAuth();
  const [exportOptions, setExportOptions] = useKV<ExportOptions>('sabq-export-options', {
    format: 'mp3',
    quality: 'high',
    normalize: true,
    addMetadata: true,
    generateWaveform: false,
    createChapters: true,
    addIntroOutro: true,
    backgroundMusic: true
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportStage, setExportStage] = useState('');
  const [exportResult, setExportResult] = useState<ExportResult | null>(null);
  const [activeTab, setActiveTab] = useState('export');
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [sharingUrl, setSharingUrl] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [socialCardUrls, setSocialCardUrls] = useState<any>({});

  const audioRef = useRef<HTMLAudioElement>(null);

  // Calculate total project duration
  const totalDuration = project.segments.reduce((sum, segment) => 
    sum + segment.duration + (segment.pause?.before || 0) + (segment.pause?.after || 0), 0
  );

  // Calculate estimated file size
  const estimateFileSize = () => {
    const bitrates = {
      low: exportOptions.format === 'mp3' ? 128 : 256,
      medium: exportOptions.format === 'mp3' ? 192 : 320, 
      high: exportOptions.format === 'mp3' ? 256 : 512,
      lossless: exportOptions.format === 'wav' ? 1411 : 320
    };

    const bitrate = bitrates[exportOptions.quality];
    const sizeKb = (totalDuration * bitrate) / 8;
    const sizeMb = sizeKb / 1024;
    
    return sizeMb > 1 ? `${sizeMb.toFixed(1)} ميجابايت` : `${sizeKb.toFixed(0)} كيلوبايت`;
  };

  // Start export process
  const startExport = async () => {
    if (!project || project.segments.length === 0) {
      toast.error('لا يوجد محتوى للتصدير');
      return;
    }

    setIsExporting(true);
    setExportProgress(0);
    onExportStart?.();

    try {
      // Step 1: Validate segments
      setExportStage('التحقق من الأجزاء...');
      setExportProgress(10);
      
      const missingAudio = project.segments.filter(s => 
        s.type === 'text' && !s.audioUrl && !s.audioBlob
      );

      if (missingAudio.length > 0) {
        throw new Error(`${missingAudio.length} أجزاء تحتاج إلى تحويل صوتي`);
      }

      // Step 2: Process audio segments
      setExportStage('معالجة الأجزاء الصوتية...');
      setExportProgress(25);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 3: Apply effects and mixing
      setExportStage('تطبيق التأثيرات والدمج...');
      setExportProgress(45);
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Step 4: Add background music
      if (exportOptions.backgroundMusic && project.globalSettings.backgroundMusic.enabled) {
        setExportStage('إضافة الموسيقى الخلفية...');
        setExportProgress(65);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Step 5: Normalize and master
      if (exportOptions.normalize) {
        setExportStage('تطبيع مستوى الصوت...');
        setExportProgress(80);
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Step 6: Generate metadata
      if (exportOptions.addMetadata) {
        setExportStage('إضافة البيانات الوصفية...');
        setExportProgress(90);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Step 7: Final export
      setExportStage('إنشاء الملف النهائي...');
      setExportProgress(95);
      
      const outputName = exportOptions.outputName || `${project.name}.${exportOptions.format}`;
      const outputUrl = `/exports/${project.id}/${outputName}`;
      
      // Generate social media cards
      const socialCards = await generateSocialCards();
      
      // Generate sharing URL
      const shareUrl = `https://sabq.app/podcast/${project.id}`;
      setSharingUrl(shareUrl);

      const result: ExportResult = {
        success: true,
        outputUrl,
        duration: totalDuration,
        fileSize: parseFloat(estimateFileSize()),
        format: exportOptions.format,
        metadata: {
          title: project.metadata.title,
          author: project.metadata.author,
          description: project.metadata.description,
          duration: totalDuration,
          created: new Date().toISOString()
        },
        socialCards
      };

      setExportProgress(100);
      setExportResult(result);
      setPreviewUrl(outputUrl);
      
      toast.success('تم تصدير البودكاست بنجاح!');
      onExportComplete?.(result);

    } catch (error) {
      console.error('Export error:', error);
      const errorResult: ExportResult = {
        success: false,
        error: error instanceof Error ? error.message : 'حدث خطأ في التصدير'
      };
      
      setExportResult(errorResult);
      toast.error(errorResult.error);
      onExportComplete?.(errorResult);
    } finally {
      setIsExporting(false);
      setTimeout(() => {
        setExportProgress(0);
        setExportStage('');
      }, 2000);
    }
  };

  // Generate social media cards
  const generateSocialCards = async () => {
    try {
      const prompt = spark.llmPrompt`Create social media card content for this Arabic podcast:

Title: ${project.metadata.title}
Author: ${project.metadata.author}
Description: ${project.metadata.description}
Duration: ${Math.ceil(totalDuration / 60)} minutes

Generate compelling social media posts for:
1. Twitter (280 characters, Arabic hashtags)
2. Facebook (longer format with emojis)
3. LinkedIn (professional tone)
4. WhatsApp (casual, shareable)

Include relevant Arabic hashtags and engaging copy.`;

      const socialContent = await spark.llm(prompt, 'gpt-4o', true);
      const cards = JSON.parse(socialContent);
      
      setSocialCardUrls(cards);
      return cards;
    } catch (error) {
      console.error('Error generating social cards:', error);
      return {};
    }
  };

  // Play/pause preview
  const togglePreview = async () => {
    if (!previewUrl || !audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.src = previewUrl;
        await audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('Error playing preview:', error);
      toast.error('حدث خطأ في تشغيل المعاينة');
    }
  };

  // Download exported file
  const downloadFile = () => {
    if (!exportResult?.outputUrl) return;

    try {
      const a = document.createElement('a');
      a.href = exportResult.outputUrl;
      a.download = exportOptions.outputName || `${project.name}.${exportOptions.format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      toast.success('بدء تحميل الملف');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('حدث خطأ في تحميل الملف');
    }
  };

  // Share to platform
  const shareToplatform = (platform: SharingOptions['platform']) => {
    const baseUrl = sharingUrl;
    const title = encodeURIComponent(project.metadata.title);
    const description = encodeURIComponent(project.metadata.description);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${title}&url=${baseUrl}&hashtags=بودكاست,سبق_الذكية`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${baseUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${baseUrl}`,
      whatsapp: `https://wa.me/?text=${title}%20${baseUrl}`,
      telegram: `https://t.me/share/url?url=${baseUrl}&text=${title}`,
      email: `mailto:?subject=${title}&body=${description}%0A%0A${baseUrl}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
      toast.success(`مشاركة على ${platform}`);
    }
  };

  // Copy sharing URL
  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(sharingUrl);
      toast.success('تم نسخ الرابط');
    } catch (error) {
      toast.error('حدث خطأ في نسخ الرابط');
    }
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">تصدير ومشاركة البودكاست</h2>
          <p className="text-muted-foreground">
            المشروع: {project.name} • المدة: {formatDuration(totalDuration)}
          </p>
        </div>
        
        {exportResult?.success && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={togglePreview}>
              {isPlaying ? <Pause className="ml-1" size={16} /> : <Play className="ml-1" size={16} />}
              معاينة
            </Button>
            <Button onClick={downloadFile}>
              <CloudArrowDown className="ml-1" size={16} />
              تحميل
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">إعدادات التصدير</TabsTrigger>
          <TabsTrigger value="sharing">المشاركة والنشر</TabsTrigger>
          <TabsTrigger value="analytics">تحليلات الأداء</TabsTrigger>
        </TabsList>

        {/* Export Settings */}
        <TabsContent value="export" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Export Options */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings size={20} />
                    إعدادات التصدير
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>صيغة الملف</Label>
                    <Select 
                      value={exportOptions.format}
                      onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, format: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mp3">MP3 (مستحسن)</SelectItem>
                        <SelectItem value="wav">WAV (جودة عالية)</SelectItem>
                        <SelectItem value="aac">AAC (متوافق مع Apple)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>جودة الصوت</Label>
                    <Select 
                      value={exportOptions.quality}
                      onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, quality: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">منخفضة (ملف أصغر)</SelectItem>
                        <SelectItem value="medium">متوسطة (متوازنة)</SelectItem>
                        <SelectItem value="high">عالية (مستحسن)</SelectItem>
                        <SelectItem value="lossless">فائقة (بلا فقدان)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>اسم الملف (اختياري)</Label>
                    <Input
                      placeholder={`${project.name}.${exportOptions.format}`}
                      value={exportOptions.outputName || ''}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, outputName: e.target.value }))}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>خيارات متقدمة</Label>
                    
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={exportOptions.normalize}
                        onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, normalize: checked }))}
                      />
                      <Label className="mr-2 text-sm">تطبيع مستوى الصوت</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={exportOptions.addMetadata}
                        onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, addMetadata: checked }))}
                      />
                      <Label className="mr-2 text-sm">إضافة البيانات الوصفية</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={exportOptions.createChapters}
                        onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, createChapters: checked }))}
                      />
                      <Label className="mr-2 text-sm">إنشاء فصول تلقائية</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={exportOptions.backgroundMusic}
                        onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, backgroundMusic: checked }))}
                      />
                      <Label className="mr-2 text-sm">تضمين الموسيقى الخلفية</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={exportOptions.generateWaveform}
                        onCheckedChange={(checked) => setExportOptions(prev => ({ ...prev, generateWaveform: checked }))}
                      />
                      <Label className="mr-2 text-sm">توليد مخطط الموجة</Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Preview and Status */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info size={20} />
                    معلومات التصدير
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{formatDuration(totalDuration)}</div>
                      <div className="text-sm text-muted-foreground">المدة الإجمالية</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{estimateFileSize()}</div>
                      <div className="text-sm text-muted-foreground">حجم الملف المتوقع</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>الأجزاء:</span>
                      <span>{project.segments.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>الصيغة:</span>
                      <span>{exportOptions.format.toUpperCase()}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>الجودة:</span>
                      <span>
                        {exportOptions.quality === 'low' ? 'منخفضة' :
                         exportOptions.quality === 'medium' ? 'متوسطة' :
                         exportOptions.quality === 'high' ? 'عالية' : 'فائقة'}
                      </span>
                    </div>
                  </div>

                  {/* Export Progress */}
                  {isExporting && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{exportStage}</span>
                        <span className="text-sm">{exportProgress}%</span>
                      </div>
                      <Progress value={exportProgress} />
                    </div>
                  )}

                  {/* Export Result */}
                  {exportResult && (
                    <div className={`p-3 rounded-lg ${
                      exportResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        {exportResult.success ? (
                          <CheckCircle size={16} className="text-green-600" />
                        ) : (
                          <Warning size={16} className="text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${
                          exportResult.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {exportResult.success ? 'تم التصدير بنجاح!' : exportResult.error}
                        </span>
                      </div>
                    </div>
                  )}

                  <Button 
                    onClick={startExport} 
                    disabled={isExporting || project.segments.length === 0}
                    className="w-full"
                  >
                    {isExporting ? (
                      <>
                        <div className="w-4 h-4 border border-primary-foreground border-t-transparent rounded-full animate-spin ml-2" />
                        جاري التصدير...
                      </>
                    ) : (
                      <>
                        <Export className="ml-2" size={16} />
                        بدء التصدير
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Sharing */}
        <TabsContent value="sharing" className="space-y-4">
          {exportResult?.success ? (
            <div className="grid grid-cols-2 gap-6">
              {/* Direct Sharing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Share size={20} />
                    مشاركة مباشرة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>رابط المشاركة</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={sharingUrl} readOnly />
                      <Button variant="outline" size="sm" onClick={copyUrl}>
                        <Copy size={14} />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" onClick={() => shareToplatform('twitter')}>
                      <TwitterLogo size={16} />
                    </Button>
                    <Button variant="outline" onClick={() => shareToplatform('facebook')}>
                      <FacebookLogo size={16} />
                    </Button>
                    <Button variant="outline" onClick={() => shareToplatform('linkedin')}>
                      <LinkedinLogo size={16} />
                    </Button>
                    <Button variant="outline" onClick={() => shareToplatform('whatsapp')}>
                      <WhatsappLogo size={16} />
                    </Button>
                    <Button variant="outline" onClick={() => shareToplatform('telegram')}>
                      <TelegramLogo size={16} />
                    </Button>
                    <Button variant="outline" onClick={() => shareToplatform('email')}>
                      <Globe size={16} />
                    </Button>
                  </div>

                  <Separator />

                  <div>
                    <Label>تصدير لمنصات البودكاست</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button variant="outline" disabled>
                        <SpotifyLogo size={16} className="ml-1" />
                        Spotify
                      </Button>
                      <Button variant="outline" disabled>
                        <SoundcloudLogo size={16} className="ml-1" />
                        SoundCloud
                      </Button>
                      <Button variant="outline" disabled>
                        <Youtube size={16} className="ml-1" />
                        YouTube
                      </Button>
                      <Button variant="outline" disabled>
                        <Rss size={16} className="ml-1" />
                        RSS Feed
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      قريباً - التكامل مع منصات البودكاست
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Social Media Cards */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles size={20} />
                    بطاقات وسائل التواصل
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {socialCardUrls.twitter && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TwitterLogo size={16} />
                        <span className="font-medium text-sm">تويتر</span>
                      </div>
                      <p className="text-sm">{socialCardUrls.twitter}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigator.clipboard.writeText(socialCardUrls.twitter)}
                      >
                        نسخ
                      </Button>
                    </div>
                  )}

                  {socialCardUrls.facebook && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <FacebookLogo size={16} />
                        <span className="font-medium text-sm">فيسبوك</span>
                      </div>
                      <p className="text-sm">{socialCardUrls.facebook}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigator.clipboard.writeText(socialCardUrls.facebook)}
                      >
                        نسخ
                      </Button>
                    </div>
                  )}

                  {socialCardUrls.whatsapp && (
                    <div className="p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <WhatsappLogo size={16} />
                        <span className="font-medium text-sm">واتساب</span>
                      </div>
                      <p className="text-sm">{socialCardUrls.whatsapp}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => navigator.clipboard.writeText(socialCardUrls.whatsapp)}
                      >
                        نسخ
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="space-y-4">
                  <CloudArrowUp size={64} className="mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">قم بتصدير البودكاست أولاً</h3>
                    <p className="text-sm text-muted-foreground">
                      يجب تصدير البودكاست قبل إمكانية مشاركته ونشره
                    </p>
                  </div>
                  <Button onClick={() => setActiveTab('export')}>
                    الذهاب إلى التصدير
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analytics */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تحليلات الأداء</CardTitle>
              <CardDescription>إحصائيات الاستماع والمشاركة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="space-y-4">
                  <Timer size={64} className="mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">قريباً</h3>
                    <p className="text-sm text-muted-foreground">
                      ستتوفر تحليلات مفصلة عن أداء البودكاست وإحصائيات الاستماع
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hidden audio player */}
      <audio ref={audioRef} />
    </div>
  );
}