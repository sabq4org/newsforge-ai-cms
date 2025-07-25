import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { safeDateFormat } from '@/lib/utils';
import { 
  Play,
  Pause,
  Download,
  Waveform,
  Video,
  Microphone,
  Settings,
  VolumeHigh,
  Timer,
  FileAudio,
  FileVideo,
  Magic,
  Sparkles,
  Robot,
  Users,
  Globe,
  Share,
  Eye,
  CheckCircle,
  Clock,
  Trash
} from '@phosphor-icons/react';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface AudioGeneration {
  id: string;
  articleId: string;
  article: Article;
  type: 'tts' | 'podcast' | 'summary';
  language: 'ar' | 'en';
  voice: string;
  speed: number;
  pitch: number;
  audioUrl?: string;
  duration?: number;
  status: 'generating' | 'completed' | 'failed';
  createdAt: Date;
  settings: {
    includeIntro: boolean;
    includeOutro: boolean;
    backgroundMusic: boolean;
    pauseLength: number;
  };
}

interface VideoSummary {
  id: string;
  articleId: string;
  article: Article;
  type: 'short' | 'medium' | 'detailed';
  style: 'news' | 'explainer' | 'social';
  duration: number;
  videoUrl?: string;
  thumbnailUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: Date;
  script: string;
  voiceOver: boolean;
}

interface MediaGeneratorProps {
  articles?: Article[];
  selectedArticle?: Article;
}

const ARABIC_VOICES = [
  { id: 'fahad', name: 'فهد - صوت رجالي عميق', gender: 'male', style: 'formal' },
  { id: 'sara', name: 'سارة - صوت نسائي واضح', gender: 'female', style: 'friendly' },
  { id: 'ahmed', name: 'أحمد - صوت إخباري', gender: 'male', style: 'news' },
  { id: 'layla', name: 'ليلى - صوت تقديمي', gender: 'female', style: 'presentation' }
];

const VIDEO_STYLES = [
  { id: 'news', name: 'إخباري تقليدي', description: 'أسلوب إخباري كلاسيكي مع خلفية بسيطة' },
  { id: 'explainer', name: 'تفسيري متحرك', description: 'رسوم متحركة وإنفوجرافيك توضيحي' },
  { id: 'social', name: 'وسائل التواصل', description: 'محتوى سريع مناسب للمنصات الاجتماعية' }
];

export function MediaGenerator({ articles = [], selectedArticle }: MediaGeneratorProps) {
  const { user } = useAuth();
  const [audioGenerations, setAudioGenerations] = useKV<AudioGeneration[]>('sabq-audio-generations', []);
  const [videoSummaries, setVideoSummaries] = useKV<VideoSummary[]>('sabq-video-summaries', []);
  const [activeTab, setActiveTab] = useState('audio');
  const [selectedArticleId, setSelectedArticleId] = useState(selectedArticle?.id || '');
  
  // Audio generation state
  const [audioForm, setAudioForm] = useState({
    type: 'tts' as 'tts' | 'podcast' | 'summary',
    language: 'ar' as 'ar' | 'en',
    voice: 'fahad',
    speed: 1.0,
    pitch: 1.0,
    includeIntro: true,
    includeOutro: true,
    backgroundMusic: false,
    pauseLength: 1.0
  });

  // Video generation state
  const [videoForm, setVideoForm] = useState({
    type: 'short' as 'short' | 'medium' | 'detailed',
    style: 'news' as 'news' | 'explainer' | 'social',
    duration: 60,
    voiceOver: true,
    includeSubtitles: true,
    aspectRatio: '16:9' as '16:9' | '9:16' | '1:1'
  });

  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<AudioGeneration | null>(null);

  // Generate audio content
  const generateAudio = async () => {
    const article = articles.find(a => a.id === selectedArticleId);
    if (!article) {
      toast.error('يرجى اختيار مقال');
      return;
    }

    setIsGeneratingAudio(true);
    setGenerationProgress(0);

    try {
      // Step 1: Prepare content
      setGenerationProgress(20);
      const prompt = spark.llmPrompt`Create an Arabic audio script for this news article:

Title: ${article.title}
Content: ${article.content}
Type: ${audioForm.type}

Instructions:
- Generate a natural, flowing Arabic script suitable for ${audioForm.type}
- Include appropriate pauses and emphasis
- Add intro/outro if specified: ${audioForm.includeIntro ? 'yes' : 'no'}
- Target duration: ${audioForm.type === 'summary' ? '2-3 minutes' : '5-8 minutes'}
- Voice style: ${ARABIC_VOICES.find(v => v.id === audioForm.voice)?.style}

Return the script with timing markers like [PAUSE:2] for pauses.`;

      const script = await spark.llm(prompt);
      setGenerationProgress(50);

      // Step 2: Generate audio (simulated)
      // In a real implementation, this would call a TTS service
      await new Promise(resolve => setTimeout(resolve, 3000));
      setGenerationProgress(80);

      // Step 3: Save generation record
      const audioGeneration: AudioGeneration = {
        id: `audio_${Date.now()}`,
        articleId: article.id,
        article,
        type: audioForm.type,
        language: audioForm.language,
        voice: audioForm.voice,
        speed: audioForm.speed,
        pitch: audioForm.pitch,
        audioUrl: `/generated/audio_${Date.now()}.mp3`, // Mock URL
        duration: audioForm.type === 'summary' ? 180 : 420, // Mock duration
        status: 'completed',
        createdAt: new Date(),
        settings: {
          includeIntro: audioForm.includeIntro,
          includeOutro: audioForm.includeOutro,
          backgroundMusic: audioForm.backgroundMusic,
          pauseLength: audioForm.pauseLength
        }
      };

      setAudioGenerations(current => [audioGeneration, ...current]);
      setGenerationProgress(100);
      
      toast.success('تم إنشاء الملف الصوتي بنجاح');

    } catch (error) {
      console.error('Error generating audio:', error);
      toast.error('حدث خطأ في إنشاء الملف الصوتي');
    } finally {
      setIsGeneratingAudio(false);
      setGenerationProgress(0);
    }
  };

  // Generate video summary
  const generateVideo = async () => {
    const article = articles.find(a => a.id === selectedArticleId);
    if (!article) {
      toast.error('يرجى اختيار مقال');
      return;
    }

    setIsGeneratingVideo(true);
    setGenerationProgress(0);

    try {
      // Step 1: Generate script
      setGenerationProgress(15);
      const scriptPrompt = spark.llmPrompt`Create a ${videoForm.type} video script for this Arabic news article:

Title: ${article.title}
Content: ${article.content}
Style: ${videoForm.style}
Duration: ${videoForm.duration} seconds

Instructions:
- Create engaging visual descriptions and narration
- Include specific visual cues for ${videoForm.style} style
- Break down into scenes with timing
- Use modern Arabic suitable for video content
- Include suggested graphics, animations, or stock footage

Return structured script with scenes, visuals, and narration.`;

      const script = await spark.llm(scriptPrompt);
      setGenerationProgress(40);

      // Step 2: Generate visual elements (simulated)
      await new Promise(resolve => setTimeout(resolve, 5000));
      setGenerationProgress(70);

      // Step 3: Assemble video (simulated)
      await new Promise(resolve => setTimeout(resolve, 3000));
      setGenerationProgress(90);

      // Step 4: Save video record
      const videoSummary: VideoSummary = {
        id: `video_${Date.now()}`,
        articleId: article.id,
        article,
        type: videoForm.type,
        style: videoForm.style,
        duration: videoForm.duration,
        videoUrl: `/generated/video_${Date.now()}.mp4`, // Mock URL
        thumbnailUrl: `/generated/thumb_${Date.now()}.jpg`, // Mock thumbnail
        status: 'completed',
        createdAt: new Date(),
        script,
        voiceOver: videoForm.voiceOver
      };

      setVideoSummaries(current => [videoSummary, ...current]);
      setGenerationProgress(100);
      
      toast.success('تم إنشاء ملخص الفيديو بنجاح');

    } catch (error) {
      console.error('Error generating video:', error);
      toast.error('حدث خطأ في إنشاء الفيديو');
    } finally {
      setIsGeneratingVideo(false);
      setGenerationProgress(0);
    }
  };

  // Audio player controls
  const playAudio = (audio: AudioGeneration) => {
    if (currentAudio?.id === audio.id && isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      setCurrentAudio(audio);
      // In real implementation, would load actual audio file
      setIsPlaying(true);
      toast.info('تشغيل الملف الصوتي (محاكاة)');
    }
  };

  const downloadAudio = (audio: AudioGeneration) => {
    // In real implementation, would trigger download
    toast.success('بدء تحميل الملف الصوتي');
  };

  const downloadVideo = (video: VideoSummary) => {
    // In real implementation, would trigger download  
    toast.success('بدء تحميل الفيديو');
  };

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
          <h1 className="text-3xl font-bold">مولد الوسائط المتعددة</h1>
          <p className="text-muted-foreground">إنشاء ملفات صوتية وفيديو من المقالات</p>
        </div>
      </div>

      {/* Article Selection */}
      <Card>
        <CardHeader>
          <CardTitle>اختيار المقال</CardTitle>
          <CardDescription>اختر المقال الذي تريد تحويله لوسائط متعددة</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedArticleId} onValueChange={setSelectedArticleId}>
            <SelectTrigger>
              <SelectValue placeholder="اختر مقالاً" />
            </SelectTrigger>
            <SelectContent>
              {articles.map(article => (
                <SelectItem key={article.id} value={article.id}>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{article.category?.name}</Badge>
                    {article.title}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Generation Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <FileAudio size={16} />
            إنشاء صوتي
          </TabsTrigger>
          <TabsTrigger value="video" className="flex items-center gap-2">
            <FileVideo size={16} />
            إنشاء فيديو
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <Eye size={16} />
            المكتبة
          </TabsTrigger>
        </TabsList>

        {/* Audio Generation Tab */}
        <TabsContent value="audio" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microphone size={20} />
                إعدادات الإنتاج الصوتي
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>نوع المحتوى</Label>
                  <Select value={audioForm.type} onValueChange={(value: any) =>
                    setAudioForm(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tts">تحويل النص إلى كلام</SelectItem>
                      <SelectItem value="podcast">حلقة بودكاست</SelectItem>
                      <SelectItem value="summary">ملخص صوتي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>الصوت</Label>
                  <Select value={audioForm.voice} onValueChange={(value) =>
                    setAudioForm(prev => ({ ...prev, voice: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ARABIC_VOICES.map(voice => (
                        <SelectItem key={voice.id} value={voice.id}>
                          {voice.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>سرعة التحدث: {audioForm.speed}x</Label>
                  <Slider
                    value={[audioForm.speed]}
                    onValueChange={([value]) => setAudioForm(prev => ({ ...prev, speed: value }))}
                    min={0.5}
                    max={2.0}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label>نبرة الصوت: {audioForm.pitch}</Label>
                  <Slider
                    value={[audioForm.pitch]}
                    onValueChange={([value]) => setAudioForm(prev => ({ ...prev, pitch: value }))}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={audioForm.includeIntro}
                    onChange={(e) => setAudioForm(prev => ({ ...prev, includeIntro: e.target.checked }))}
                  />
                  <span className="mr-2">تضمين مقدمة</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={audioForm.includeOutro}
                    onChange={(e) => setAudioForm(prev => ({ ...prev, includeOutro: e.target.checked }))}
                  />
                  <span className="mr-2">تضمين خاتمة</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={audioForm.backgroundMusic}
                    onChange={(e) => setAudioForm(prev => ({ ...prev, backgroundMusic: e.target.checked }))}
                  />
                  <span className="mr-2">موسيقى خلفية</span>
                </label>
              </div>

              {(isGeneratingAudio || generationProgress > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">جاري الإنتاج...</span>
                    <span className="text-sm">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} />
                </div>
              )}

              <Button 
                onClick={generateAudio} 
                disabled={!selectedArticleId || isGeneratingAudio}
                className="w-full"
              >
                <Magic className="ml-2" size={16} />
                {isGeneratingAudio ? 'جاري الإنتاج...' : 'إنشاء ملف صوتي'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Video Generation Tab */}
        <TabsContent value="video" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video size={20} />
                إعدادات إنتاج الفيديو
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>نوع الفيديو</Label>
                  <Select value={videoForm.type} onValueChange={(value: any) =>
                    setVideoForm(prev => ({ ...prev, type: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">قصير (30-60 ثانية)</SelectItem>
                      <SelectItem value="medium">متوسط (1-3 دقائق)</SelectItem>
                      <SelectItem value="detailed">مفصل (3-5 دقائق)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>أسلوب الإنتاج</Label>
                  <Select value={videoForm.style} onValueChange={(value: any) =>
                    setVideoForm(prev => ({ ...prev, style: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_STYLES.map(style => (
                        <SelectItem key={style.id} value={style.id}>
                          {style.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>المدة بالثواني</Label>
                  <Input
                    type="number"
                    value={videoForm.duration}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    min={30}
                    max={300}
                  />
                </div>
                
                <div>
                  <Label>نسبة العرض</Label>
                  <Select value={videoForm.aspectRatio} onValueChange={(value: any) =>
                    setVideoForm(prev => ({ ...prev, aspectRatio: value }))
                  }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">16:9 (YouTube, Desktop)</SelectItem>
                      <SelectItem value="9:16">9:16 (Instagram Stories, TikTok)</SelectItem>
                      <SelectItem value="1:1">1:1 (Instagram Post)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={videoForm.voiceOver}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, voiceOver: e.target.checked }))}
                  />
                  <span className="mr-2">تعليق صوتي</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={videoForm.includeSubtitles}
                    onChange={(e) => setVideoForm(prev => ({ ...prev, includeSubtitles: e.target.checked }))}
                  />
                  <span className="mr-2">ترجمة نصية</span>
                </label>
              </div>

              {(isGeneratingVideo || generationProgress > 0) && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">جاري إنتاج الفيديو...</span>
                    <span className="text-sm">{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} />
                </div>
              )}

              <Button 
                onClick={generateVideo} 
                disabled={!selectedArticleId || isGeneratingVideo}
                className="w-full"
              >
                <Sparkles className="ml-2" size={16} />
                {isGeneratingVideo ? 'جاري الإنتاج...' : 'إنشاء فيديو'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="space-y-6">
          {/* Audio Library */}
          <Card>
            <CardHeader>
              <CardTitle>مكتبة الملفات الصوتية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {audioGenerations.map(audio => (
                  <div key={audio.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => playAudio(audio)}
                        >
                          {currentAudio?.id === audio.id && isPlaying ? (
                            <Pause size={16} />
                          ) : (
                            <Play size={16} />
                          )}
                        </Button>
                        <Waveform size={16} className="text-muted-foreground" />
                      </div>
                      
                      <div>
                        <p className="font-medium">{audio.article.title}</p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Timer size={12} />
                            {audio.duration ? formatDuration(audio.duration) : 'غير محدد'}
                          </span>
                          <Badge variant="outline">{audio.type}</Badge>
                          <Badge variant="outline">{audio.voice}</Badge>
                          <span>
                            {safeDateFormat(audio.createdAt, 'ar-SA', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={audio.status === 'completed' ? 'default' : 'secondary'}>
                        {audio.status === 'completed' ? 'مكتمل' : audio.status}
                      </Badge>
                      <Button variant="ghost" size="sm" onClick={() => downloadAudio(audio)}>
                        <Download size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Share size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
                
                {audioGenerations.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد ملفات صوتية بعد
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Video Library */}
          <Card>
            <CardHeader>
              <CardTitle>مكتبة الفيديوهات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {videoSummaries.map(video => (
                  <Card key={video.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-3">
                      <div className="aspect-video bg-muted rounded-lg mb-3 relative overflow-hidden">
                        {video.thumbnailUrl ? (
                          <img src={video.thumbnailUrl} alt={video.article.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Video size={48} className="text-muted-foreground" />
                          </div>
                        )}
                        <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                          {formatDuration(video.duration)}
                        </div>
                      </div>
                      
                      <h3 className="font-medium text-sm mb-2 line-clamp-2">{video.article.title}</h3>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                        <Badge variant="outline">{video.type}</Badge>
                        <Badge variant="outline">{video.style}</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Badge variant={video.status === 'completed' ? 'default' : 'secondary'}>
                          {video.status === 'completed' ? 'مكتمل' : video.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => downloadVideo(video)}>
                            <Download size={12} />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Share size={12} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {videoSummaries.length === 0 && (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    لا توجد فيديوهات بعد
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hidden audio element for playback */}
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
    </div>
  );
}