import { useState, useRef, useEffect, useCallback } from 'react';
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
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Play,
  Pause,
  Stop,
  SkipForward,
  SkipBack,
  Download,
  Upload,
  Waveform,
  Microphone,
  MicrophoneSlash,
  Settings,
  VolumeHigh,
  VolumeLow,
  VolumeX,
  Timer,
  FileAudio,
  Magic,
  Sparkles,
  Robot,
  Globe,
  Share,
  Eye,
  CheckCircle,
  Clock,
  Trash,
  Edit,
  Copy,
  Scissors,
  Shuffle,
  Repeat,
  SpeakerHigh,
  SpeakerLow,
  SpeakerX,
  Equalizer,
  MusicNote,
  Record,
  RecordFill,
  ArrowLeft,
  ArrowRight,
  CaretLeft,
  CaretRight,
  DotsThree,
  Plus,
  Minus,
  X,
  FloppyDisk,
  FolderOpen,
  CloudArrowDown,
  Waveform as WaveformIcon,
  MusicNotes,
  SpeakerSimpleHigh,
  Headphones
import { AdvancedTTSControls } from './AdvancedTTSControls';
import { AudioLibraryBrowser } from './AudioLibraryBrowser';
import { PodcastExporter } from './PodcastExporter';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  elevenLabsService, 
  ARABIC_VOICE_MAPPING, 
  ARABIC_VOICE_CONFIGS,
  optimizeArabicText,
  estimateArabicDuration,
  validateElevenLabsKey
} from '@/services/elevenlabs';

interface AudioSegment {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  pause: {
    before: number;
    after: number;
  };
  effects: {
    fade: { in: number; out: number };
    echo: number;
    reverb: number;
    noise: boolean;
  };
  type: 'text' | 'intro' | 'outro' | 'transition' | 'music' | 'sfx';
  isLocked: boolean;
  audioUrl?: string;
  audioBlob?: Blob;
  optimizedText?: string;
  elevenLabsVoiceId?: string;
  elevenLabsSettings?: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
  generationStatus?: 'pending' | 'generating' | 'completed' | 'failed';
  generationProgress?: number;
}

interface AudioProject {
  id: string;
  name: string;
  articleId: string;
  article: Article;
  segments: AudioSegment[];
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
  };
  status: 'draft' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
  outputUrl?: string;
  waveformData?: number[];
}

interface AudioEditorProps {
  article?: Article;
  project?: AudioProject;
  onSave?: (project: AudioProject) => void;
  onExport?: (project: AudioProject) => void;
}

const ARABIC_VOICES = [
  { 
    id: 'fahad_premium', 
    name: 'فهد المحترف - صوت رجالي عميق', 
    gender: 'male', 
    style: 'formal',
    description: 'صوت رجالي عميق ومتميز، مناسب للأخبار الرسمية والمحتوى الاحترافي',
    elevenLabsId: ARABIC_VOICE_MAPPING.fahad_premium,
    recommended: true
  },
  { 
    id: 'sara_news', 
    name: 'سارة الإخبارية - صوت نسائي واضح', 
    gender: 'female', 
    style: 'news',
    description: 'صوت نسائي واضح واحترافي، مثالي للنشرات الإخبارية',
    elevenLabsId: ARABIC_VOICE_MAPPING.sara_news,
    recommended: true
  },
  { 
    id: 'ahmed_warm', 
    name: 'أحمد الدافئ - صوت تعليمي', 
    gender: 'male', 
    style: 'warm',
    description: 'صوت دافئ ومطمئن مناسب للمحتوى التعليمي والثقافي',
    elevenLabsId: ARABIC_VOICE_MAPPING.ahmed_warm,
    recommended: false
  },
  { 
    id: 'layla_modern', 
    name: 'ليلى العصرية - صوت شبابي', 
    gender: 'female', 
    style: 'casual',
    description: 'صوت شبابي حيوي مناسب للبودكاست والمحتوى غير الرسمي',
    elevenLabsId: ARABIC_VOICE_MAPPING.layla_modern,
    recommended: false
  },
  { 
    id: 'omar_authority', 
    name: 'عمر السلطة - صوت موثوق', 
    gender: 'male', 
    style: 'authoritative',
    description: 'صوت موثوق وقوي للمحتوى الرسمي والتحليلات',
    elevenLabsId: ARABIC_VOICE_MAPPING.omar_authority,
    recommended: false
  },
  { 
    id: 'nour_gentle', 
    name: 'نور الرقيقة - صوت ودود', 
    gender: 'female', 
    style: 'friendly',
    description: 'صوت رقيق وودود مناسب للمحتوى الاجتماعي والثقافي',
    elevenLabsId: ARABIC_VOICE_MAPPING.nour_gentle,
    recommended: false
  }
];

const MUSIC_LIBRARY = [
  { id: 'news_intro', name: 'مقدمة إخبارية', type: 'intro', duration: 10 },
  { id: 'soft_background', name: 'موسيقى خلفية هادئة', type: 'background', duration: 300 },
  { id: 'transition', name: 'انتقال موسيقي', type: 'transition', duration: 3 },
  { id: 'outro', name: 'خاتمة', type: 'outro', duration: 8 },
  { id: 'tech_beat', name: 'إيقاع تقني', type: 'background', duration: 240 }
];

const SOUND_EFFECTS = [
  { id: 'notification', name: 'تنبيه', duration: 2 },
  { id: 'typewriter', name: 'آلة كاتبة', duration: 1 },
  { id: 'page_turn', name: 'قلب صفحة', duration: 1.5 },
  { id: 'phone_ring', name: 'رنين هاتف', duration: 3 },
  { id: 'applause', name: 'تصفيق', duration: 5 }
];

export function AudioEditor({ article, project: initialProject, onSave, onExport }: AudioEditorProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useKV<AudioProject[]>('sabq-audio-projects', []);
  const [currentProject, setCurrentProject] = useState<AudioProject | null>(initialProject || null);
  const [activeTab, setActiveTab] = useState('editor');
  const [selectedSegmentId, setSelectedSegmentId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSegment, setRecordingSegment] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [availableElevenLabsVoices, setAvailableElevenLabsVoices] = useState<any[]>([]);
  const [backgroundMusicEnabled, setBackgroundMusicEnabled] = useState(false);
  const [selectedBackgroundMusic, setSelectedBackgroundMusic] = useState<string>('');
  const [showVoicePreview, setShowVoicePreview] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  // Check API key validity on component mount
  useEffect(() => {
    const checkApiKey = async () => {
      const isValid = await validateElevenLabsKey();
      setApiKeyValid(isValid);
      
      if (isValid) {
        // Load available voices
        const voices = await elevenLabsService.getVoices();
        setAvailableElevenLabsVoices(voices);
        toast.success('تم التحقق من مفتاح ElevenLabs بنجاح');
      } else {
        toast.error('مفتاح ElevenLabs غير صحيح - سيتم استخدام المحاكي');
      }
    };
    
    checkApiKey();
  }, []);

  // Initialize new project from article
  const createProjectFromArticle = useCallback(async (article: Article) => {
    if (!user) return;

    // Generate initial segments using AI
    const prompt = spark.llmPrompt`Create a podcast script structure from this Arabic article:

Title: ${article.title}
Content: ${article.content}
Category: ${article.category?.name}

Instructions:
- Break the content into logical segments for audio production
- Include intro, main content segments, and outro
- Add natural pauses and transitions
- Estimate timing for each segment
- Use engaging podcast-style language
- Include voice direction notes

Return a JSON structure with segments including: text, estimated_duration, voice_notes, type (intro/content/outro/transition)`;

    try {
      const scriptResponse = await spark.llm(prompt, 'gpt-4o', true);
      const scriptData = JSON.parse(scriptResponse);

      const segments: AudioSegment[] = scriptData.segments?.map((seg: any, index: number) => ({
        id: `segment_${Date.now()}_${index}`,
        text: seg.text || '',
        startTime: 0,
        duration: seg.estimated_duration || 10,
        voice: 'fahad_premium',
        speed: 1.0,
        pitch: 1.0,
        volume: 1.0,
        pause: {
          before: index === 0 ? 0 : 1,
          after: 1
        },
        effects: {
          fade: { in: 0.5, out: 0.5 },
          echo: 0,
          reverb: 0,
          noise: false
        },
        type: seg.type || 'text',
        isLocked: false,
        elevenLabsVoiceId: ARABIC_VOICE_MAPPING.fahad_premium,
        elevenLabsSettings: ARABIC_VOICE_CONFIGS.fahad_premium,
        generationStatus: 'pending'
      })) || [];

      const newProject: AudioProject = {
        id: `project_${Date.now()}`,
        name: `بودكاست: ${article.title}`,
        articleId: article.id,
        article,
        segments,
        globalSettings: {
          outputFormat: 'mp3',
          sampleRate: 44100,
          bitrate: 192,
          normalize: true,
          limitPeaks: true,
          backgroundMusic: {
            enabled: false,
            volume: 0.3,
            fadeIn: 3,
            fadeOut: 3
          }
        },
        metadata: {
          title: article.title,
          author: article.author.name,
          description: article.excerpt,
          language: 'ar',
          genre: 'News'
        },
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setCurrentProject(newProject);
      setProjects(current => [newProject, ...current]);
      toast.success('تم إنشاء مشروع صوتي جديد');

    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('حدث خطأ في إنشاء المشروع');
    }
  }, [user, setProjects]);

  // Initialize project when article is provided
  useEffect(() => {
    if (article && !currentProject) {
      createProjectFromArticle(article);
    }
  }, [article, currentProject, createProjectFromArticle]);

  // Calculate total duration
  useEffect(() => {
    if (currentProject) {
      const total = currentProject.segments.reduce((sum, segment) => 
        sum + segment.duration + segment.pause.before + segment.pause.after, 0
      );
      setTotalDuration(total);
    }
  }, [currentProject]);

  // Generate TTS for segment using ElevenLabs
  const generateTTS = async (segment: AudioSegment) => {
    setIsProcessing(true);
    setProcessingProgress(0);

    // Update segment status
    updateSegment(segment.id, { 
      generationStatus: 'generating',
      generationProgress: 0
    });

    try {
      const voice = ARABIC_VOICES.find(v => v.id === segment.voice);
      
      setProcessingProgress(10);
      
      // Step 1: Optimize text for Arabic TTS
      const optimizedText = await optimizeArabicText(segment.text);
      setProcessingProgress(30);
      
      updateSegment(segment.id, { 
        optimizedText,
        generationProgress: 30
      });

      // Step 2: Generate audio using ElevenLabs
      if (apiKeyValid && voice?.elevenLabsId) {
        setProcessingProgress(50);
        
        const elevenLabsConfig = ARABIC_VOICE_CONFIGS[segment.voice as keyof typeof ARABIC_VOICE_CONFIGS];
        
        const audioBlob = await elevenLabsService.generateSpeech({
          voice_id: voice.elevenLabsId,
          text: optimizedText,
          model_id: 'eleven_multilingual_v2',
          stability: elevenLabsConfig.stability,
          similarity_boost: elevenLabsConfig.similarity_boost,
          style: elevenLabsConfig.style,
          use_speaker_boost: true,
          output_format: 'mp3_44100_128'
        });

        setProcessingProgress(80);

        if (audioBlob) {
          // Create audio URL
          const audioUrl = URL.createObjectURL(audioBlob);
          
          // Calculate actual duration
          const audio = new Audio(audioUrl);
          await new Promise<void>((resolve) => {
            audio.addEventListener('loadedmetadata', () => {
              const actualDuration = Math.ceil(audio.duration);
              
              updateSegment(segment.id, {
                audioUrl,
                audioBlob,
                duration: actualDuration,
                generationStatus: 'completed',
                generationProgress: 100
              });
              
              resolve();
            });
          });

          setProcessingProgress(100);
          toast.success('تم توليد الصوت بنجاح باستخدام ElevenLabs');
        } else {
          throw new Error('Failed to generate audio');
        }
      } else {
        // Fallback: Simulate TTS generation
        setProcessingProgress(70);
        await new Promise(resolve => setTimeout(resolve, 2000));

        const estimatedDuration = estimateArabicDuration(optimizedText);
        const audioUrl = `/generated/tts_${segment.id}.mp3`;

        updateSegment(segment.id, {
          audioUrl,
          duration: estimatedDuration,
          generationStatus: 'completed',
          generationProgress: 100
        });

        setProcessingProgress(100);
        toast.info('تم محاكاة توليد الصوت (ElevenLabs غير متاح)');
      }

    } catch (error) {
      console.error('Error generating TTS:', error);
      
      updateSegment(segment.id, { 
        generationStatus: 'failed',
        generationProgress: 0
      });
      
      toast.error('حدث خطأ في توليد الصوت');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // Start recording
  const startRecording = async (segmentId: string) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        
        setCurrentProject(prev => prev ? {
          ...prev,
          segments: prev.segments.map(s => s.id === segmentId ? {
            ...s,
            audioUrl,
            recordedAt: new Date()
          } : s),
          updatedAt: new Date()
        } : null);

        stream.getTracks().forEach(track => track.stop());
        toast.success('تم حفظ التسجيل');
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSegment(segmentId);
      toast.info('بدء التسجيل...');

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('حدث خطأ في بدء التسجيل');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingSegment(null);
    }
  };

  // Update segment
  const updateSegment = (segmentId: string, updates: Partial<AudioSegment>) => {
    setCurrentProject(prev => prev ? {
      ...prev,
      segments: prev.segments.map(s => s.id === segmentId ? { ...s, ...updates } : s),
      updatedAt: new Date()
    } : null);
  };

  // Add new segment
  const addSegment = (type: AudioSegment['type'] = 'text') => {
    if (!currentProject) return;

    const newSegment: AudioSegment = {
      id: `segment_${Date.now()}`,
      text: type === 'text' ? 'نص جديد...' : '',
      startTime: 0,
      duration: type === 'music' ? 30 : 10,
      voice: 'fahad_premium',
      speed: 1.0,
      pitch: 1.0,
      volume: 1.0,
      pause: { before: 1, after: 1 },
      effects: {
        fade: { in: 0.5, out: 0.5 },
        echo: 0,
        reverb: 0,
        noise: false
      },
      type,
      isLocked: false,
      elevenLabsVoiceId: ARABIC_VOICE_MAPPING.fahad_premium,
      elevenLabsSettings: ARABIC_VOICE_CONFIGS.fahad_premium,
      generationStatus: 'pending'
    };

    setCurrentProject(prev => prev ? {
      ...prev,
      segments: [...prev.segments, newSegment],
      updatedAt: new Date()
    } : null);
  };

  // Preview voice using ElevenLabs
  const previewVoice = async (voiceId: string) => {
    const voice = ARABIC_VOICES.find(v => v.id === voiceId);
    if (!voice) return;

    setShowVoicePreview(voiceId);
    
    try {
      if (apiKeyValid && voice.elevenLabsId) {
        const sampleText = "مرحباً، هذا عرض تجريبي للصوت. أنا أتحدث باللغة العربية بطريقة طبيعية ومفهومة.";
        
        const elevenLabsConfig = ARABIC_VOICE_CONFIGS[voiceId as keyof typeof ARABIC_VOICE_CONFIGS];
        
        const audioBlob = await elevenLabsService.generateSpeech({
          voice_id: voice.elevenLabsId,
          text: sampleText,
          model_id: 'eleven_multilingual_v2',
          stability: elevenLabsConfig.stability,
          similarity_boost: elevenLabsConfig.similarity_boost,
          style: elevenLabsConfig.style,
          use_speaker_boost: true,
          output_format: 'mp3_44100_128'
        });

        if (audioBlob) {
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          
          audio.addEventListener('ended', () => {
            setShowVoicePreview(null);
          });
          
          await audio.play();
          toast.success(`تشغيل عينة من صوت: ${voice.name}`);
        } else {
          throw new Error('Failed to generate preview');
        }
      } else {
        // Simulate preview
        toast.info(`معاينة صوت: ${voice.name} (محاكي)`);
        setTimeout(() => {
          setShowVoicePreview(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error previewing voice:', error);
      toast.error('حدث خطأ في معاينة الصوت');
      setShowVoicePreview(null);
    }
  };

  // Download generated audio
  const downloadAudio = (segment: AudioSegment) => {
    if (!segment.audioBlob && !segment.audioUrl) {
      toast.error('لا يوجد صوت للتحميل');
      return;
    }

    try {
      let url = segment.audioUrl;
      
      if (segment.audioBlob) {
        url = URL.createObjectURL(segment.audioBlob);
      }

      const a = document.createElement('a');
      a.href = url!;
      a.download = `segment_${segment.id}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      if (segment.audioBlob) {
        URL.revokeObjectURL(url!);
      }
      
      toast.success('تم تحميل الملف الصوتي');
    } catch (error) {
      console.error('Error downloading audio:', error);
      toast.error('حدث خطأ في تحميل الملف');
    }
  };

  // Delete segment
  const deleteSegment = (segmentId: string) => {
    setCurrentProject(prev => prev ? {
      ...prev,
      segments: prev.segments.filter(s => s.id !== segmentId),
      updatedAt: new Date()
    } : null);
    if (selectedSegmentId === segmentId) {
      setSelectedSegmentId(null);
    }
  };

  // Export audio project
  const exportProject = async () => {
    if (!currentProject) return;

    setIsProcessing(true);
    setProcessingProgress(0);

    try {
      // Step 1: Validate all segments
      setProcessingProgress(10);
      const missingAudio = currentProject.segments.filter(s => 
        s.type === 'text' && !s.audioUrl && !s.text
      );

      if (missingAudio.length > 0) {
        toast.error(`${missingAudio.length} أجزاء تحتاج إلى صوت أو نص`);
        return;
      }

      // Step 2: Generate missing TTS
      setProcessingProgress(30);
      for (const segment of currentProject.segments) {
        if (segment.type === 'text' && !segment.audioUrl && segment.text) {
          await generateTTS(segment);
        }
      }

      // Step 3: Process audio effects
      setProcessingProgress(60);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Step 4: Mix and master
      setProcessingProgress(80);
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Step 5: Export final file
      setProcessingProgress(95);
      const outputUrl = `/exports/podcast_${currentProject.id}.${currentProject.globalSettings.outputFormat}`;

      const exportedProject = {
        ...currentProject,
        status: 'completed' as const,
        outputUrl,
        updatedAt: new Date()
      };

      setCurrentProject(exportedProject);
      setProjects(current => current.map(p => p.id === currentProject.id ? exportedProject : p));
      
      setProcessingProgress(100);
      toast.success('تم تصدير البودكاست بنجاح');
      
      if (onExport) {
        onExport(exportedProject);
      }

    } catch (error) {
      console.error('Error exporting project:', error);
      toast.error('حدث خطأ في التصدير');
    } finally {
      setIsProcessing(false);
      setProcessingProgress(0);
    }
  };

  // Save project
  const saveProject = () => {
    if (!currentProject) return;

    const updatedProject = {
      ...currentProject,
      updatedAt: new Date()
    };

    setCurrentProject(updatedProject);
    setProjects(current => {
      const existing = current.find(p => p.id === updatedProject.id);
      if (existing) {
        return current.map(p => p.id === updatedProject.id ? updatedProject : p);
      } else {
        return [updatedProject, ...current];
      }
    });

    toast.success('تم حفظ المشروع');
    
    if (onSave) {
      onSave(updatedProject);
    }
  };

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get segment type icon
  const getSegmentTypeIcon = (type: AudioSegment['type']) => {
    switch (type) {
      case 'intro': return <Play size={16} />;
      case 'outro': return <Stop size={16} />;
      case 'music': return <MusicNote size={16} />;
      case 'sfx': return <SpeakerHigh size={16} />;
      case 'transition': return <ArrowRight size={16} />;
      default: return <Microphone size={16} />;
    }
  };

  // Render waveform (simplified visualization)
  const renderWaveform = () => {
    if (!canvasRef.current || !currentProject) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(0, 0, width, height);

    // Draw segments
    let currentX = 0;
    currentProject.segments.forEach((segment, index) => {
      const segmentWidth = (segment.duration / totalDuration) * width * zoomLevel;
      
      // Segment background
      ctx.fillStyle = selectedSegmentId === segment.id ? '#3b82f6' : '#64748b';
      ctx.fillRect(currentX, height * 0.3, segmentWidth, height * 0.4);

      // Segment label
      ctx.fillStyle = '#1e293b';
      ctx.font = '10px Arial';
      ctx.fillText(`${index + 1}`, currentX + 4, height * 0.25);

      currentX += segmentWidth;
    });

    // Playhead
    const playheadX = (currentTime / totalDuration) * width * zoomLevel;
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(playheadX, 0);
    ctx.lineTo(playheadX, height);
    ctx.stroke();
  };

  useEffect(() => {
    renderWaveform();
  }, [currentProject, selectedSegmentId, currentTime, zoomLevel, totalDuration]);

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-96" dir="rtl">
        <div className="text-center space-y-4">
          <FileAudio size={64} className="mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">لا يوجد مشروع صوتي</h3>
            <p className="text-muted-foreground">اختر مقالاً لإنشاء بودكاست</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedSegment = currentProject.segments.find(s => s.id === selectedSegmentId);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">محرر البودكاست المتقدم</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-muted-foreground">{currentProject.name}</p>
              <div className="flex items-center gap-1">
                {apiKeyValid === true && (
                  <Badge variant="secondary" className="text-xs">
                    <SpeakerSimpleHigh size={12} className="ml-1" />
                    ElevenLabs متصل
                  </Badge>
                )}
                {apiKeyValid === false && (
                  <Badge variant="outline" className="text-xs">
                    <SpeakerX size={12} className="ml-1" />
                    وضع المحاكي
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Badge variant="outline">{currentProject.status}</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={saveProject}>
            <FloppyDisk className="ml-2" size={16} />
            حفظ
          </Button>
          <Button onClick={exportProject} disabled={isProcessing}>
            <Download className="ml-2" size={16} />
            {isProcessing ? 'جاري التصدير...' : 'تصدير'}
          </Button>
        </div>
      </div>

      {/* Processing Progress */}
      {isProcessing && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">جاري المعالجة...</span>
                <span className="text-sm">{processingProgress}%</span>
              </div>
              <Progress value={processingProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Editor */}
      <div className="grid grid-cols-4 gap-6">
        {/* Timeline and Waveform */}
        <div className="col-span-3 space-y-4">
          <Tabs defaultValue="timeline" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="timeline">المخطط الزمني</TabsTrigger>
              <TabsTrigger value="library">مكتبة الصوتيات</TabsTrigger>
              <TabsTrigger value="advanced">إعدادات متقدمة</TabsTrigger>
              <TabsTrigger value="export">التصدير والنشر</TabsTrigger>
            </TabsList>

            <TabsContent value="timeline" className="space-y-4">
              {/* Transport Controls */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <SkipBack size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsPlaying(!isPlaying)}
                      >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <SkipForward size={16} />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Stop size={16} />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm">
                        {formatTime(currentTime)} / {formatTime(totalDuration)}
                      </span>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-sm">السرعة:</span>
                        <Select value={playbackSpeed.toString()} onValueChange={(v) => setPlaybackSpeed(parseFloat(v))}>
                          <SelectTrigger className="w-20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="0.5">0.5x</SelectItem>
                            <SelectItem value="0.75">0.75x</SelectItem>
                            <SelectItem value="1">1x</SelectItem>
                            <SelectItem value="1.25">1.25x</SelectItem>
                            <SelectItem value="1.5">1.5x</SelectItem>
                            <SelectItem value="2">2x</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setIsMuted(!isMuted)}
                        >
                          {isMuted ? <VolumeX size={16} /> : <VolumeHigh size={16} />}
                        </Button>
                        <Slider
                          value={[isMuted ? 0 : volume]}
                          onValueChange={([v]) => setVolume(v)}
                          max={1}
                          step={0.1}
                          className="w-20"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Waveform Display */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">المخطط الزمني</h3>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.5))}
                        >
                          <Minus size={16} />
                        </Button>
                        <span className="text-sm">{Math.round(zoomLevel * 100)}%</span>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setZoomLevel(Math.min(5, zoomLevel + 0.5))}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>
                    
                    <canvas
                      ref={canvasRef}
                      width={800}
                      height={200}
                      className="w-full border rounded cursor-pointer"
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const clickTime = (x / rect.width) * totalDuration / zoomLevel;
                        setCurrentTime(clickTime);
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Segments List */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>أجزاء البودكاست</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => addSegment('text')}>
                        <Plus className="ml-1" size={14} />
                        نص
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addSegment('music')}>
                        <Plus className="ml-1" size={14} />
                        موسيقى
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => addSegment('transition')}>
                        <Plus className="ml-1" size={14} />
                        انتقال
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-80">
                    <div className="space-y-2">
                      {currentProject.segments.map((segment, index) => (
                        <div
                          key={segment.id}
                          className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                            selectedSegmentId === segment.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:bg-muted/50'
                          }`}
                          onClick={() => setSelectedSegmentId(segment.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium">{index + 1}</span>
                                {getSegmentTypeIcon(segment.type)}
                              </div>
                              
                              <div className="flex-1">
                                <p className="font-medium text-sm">
                                  {segment.type === 'text' ? segment.text.substring(0, 50) + '...' : 
                                   segment.type === 'music' ? 'موسيقى خلفية' :
                                   segment.type === 'intro' ? 'مقدمة' :
                                   segment.type === 'outro' ? 'خاتمة' :
                                   'انتقال'}
                                </p>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <span>{formatTime(segment.duration)}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {ARABIC_VOICES.find(v => v.id === segment.voice)?.name.split(' - ')[0]}
                                  </Badge>
                                  <span>السرعة: {segment.speed}x</span>
                                  {segment.generationStatus && (
                                    <Badge 
                                      variant={
                                        segment.generationStatus === 'completed' ? 'default' :
                                        segment.generationStatus === 'generating' ? 'secondary' :
                                        segment.generationStatus === 'failed' ? 'destructive' : 'outline'
                                      }
                                      className="text-xs"
                                    >
                                      {segment.generationStatus === 'completed' ? 'مكتمل' :
                                       segment.generationStatus === 'generating' ? 'جاري التوليد' :
                                       segment.generationStatus === 'failed' ? 'فشل' : 'في الانتظار'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              {segment.type === 'text' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (isRecording && recordingSegment === segment.id) {
                                        stopRecording();
                                      } else {
                                        startRecording(segment.id);
                                      }
                                    }}
                                    className={isRecording && recordingSegment === segment.id ? 'text-red-500' : ''}
                                  >
                                    {isRecording && recordingSegment === segment.id ? 
                                      <RecordFill size={14} /> : <Record size={14} />
                                    }
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      generateTTS(segment);
                                    }}
                                    disabled={segment.generationStatus === 'generating'}
                                  >
                                    {segment.generationStatus === 'generating' ? 
                                      <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin" /> :
                                      <Robot size={14} />
                                    }
                                  </Button>
                                  {segment.audioUrl && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        downloadAudio(segment);
                                      }}
                                    >
                                      <CloudArrowDown size={14} />
                                    </Button>
                                  )}
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteSegment(segment.id);
                                }}
                              >
                                <Trash size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="library">
              <AudioLibraryBrowser 
                onMusicSelect={(music) => {
                  // Add background music to project
                  if (currentProject) {
                    setCurrentProject(prev => prev ? {
                      ...prev,
                      globalSettings: {
                        ...prev.globalSettings,
                        backgroundMusic: {
                          ...prev.globalSettings.backgroundMusic,
                          enabled: true,
                          url: music.url,
                          volume: music.volume_recommendation
                        }
                      }
                    } : null);
                    toast.success(`تم إضافة الموسيقى: ${music.name}`);
                  }
                }}
                onEffectSelect={(effect) => {
                  // Add sound effect as new segment
                  const newSegment: AudioSegment = {
                    id: `effect_${Date.now()}`,
                    text: '',
                    startTime: 0,
                    duration: effect.duration,
                    voice: 'fahad_premium',
                    speed: 1.0,
                    pitch: 1.0,
                    volume: effect.volume_recommendation,
                    pause: { before: 0.5, after: 0.5 },
                    effects: {
                      fade: { in: 0.1, out: 0.1 },
                      echo: 0,
                      reverb: 0,
                      noise: false
                    },
                    type: 'sfx',
                    isLocked: false,
                    audioUrl: effect.url,
                    generationStatus: 'completed'
                  };

                  setCurrentProject(prev => prev ? {
                    ...prev,
                    segments: [...prev.segments, newSegment],
                    updatedAt: new Date()
                  } : null);
                  
                  toast.success(`تم إضافة التأثير: ${effect.name}`);
                }}
              />
            </TabsContent>

            <TabsContent value="advanced">
              {selectedSegment ? (
                <AdvancedTTSControls
                  segment={selectedSegment}
                  onSettingsChange={(settings) => {
                    updateSegment(selectedSegment.id, {
                      elevenLabsSettings: settings
                    });
                  }}
                  onTextOptimized={(optimizedText) => {
                    updateSegment(selectedSegment.id, {
                      optimizedText,
                      text: optimizedText
                    });
                  }}
                  onGenerateAudio={() => generateTTS(selectedSegment)}
                />
              ) : (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <div className="space-y-4">
                      <Settings size={64} className="mx-auto text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">اختر جزءاً للتحكم المتقدم</h3>
                        <p className="text-sm text-muted-foreground">
                          حدد جزءاً من القائمة لفتح الإعدادات المتقدمة
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="export">
              <PodcastExporter 
                project={currentProject}
                onExportStart={() => {
                  toast.info('بدء عملية التصدير...');
                }}
                onExportComplete={(result) => {
                  if (result.success) {
                    setCurrentProject(prev => prev ? {
                      ...prev,
                      status: 'completed',
                      outputUrl: result.outputUrl,
                      updatedAt: new Date()
                    } : null);
                  }
                }}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Properties Panel */}
        <div className="space-y-4">
          {selectedSegment ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">خصائص الجزء</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>نوع الجزء</Label>
                  <Select 
                    value={selectedSegment.type}
                    onValueChange={(value: any) => updateSegment(selectedSegment.id, { type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">نص</SelectItem>
                      <SelectItem value="intro">مقدمة</SelectItem>
                      <SelectItem value="outro">خاتمة</SelectItem>
                      <SelectItem value="transition">انتقال</SelectItem>
                      <SelectItem value="music">موسيقى</SelectItem>
                      <SelectItem value="sfx">مؤثرات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedSegment.type === 'text' && (
                  <>
                    <div>
                      <Label>النص</Label>
                      <Textarea
                        value={selectedSegment.text}
                        onChange={(e) => updateSegment(selectedSegment.id, { text: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <div>
                      <Label>الصوت</Label>
                      <Select 
                        value={selectedSegment.voice}
                        onValueChange={(value) => {
                          const voice = ARABIC_VOICES.find(v => v.id === value);
                          updateSegment(selectedSegment.id, { 
                            voice: value,
                            elevenLabsVoiceId: voice?.elevenLabsId,
                            elevenLabsSettings: ARABIC_VOICE_CONFIGS[value as keyof typeof ARABIC_VOICE_CONFIGS]
                          });
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ARABIC_VOICES.map(voice => (
                            <SelectItem key={voice.id} value={voice.id}>
                              <div className="flex items-center gap-2">
                                {voice.name}
                                {voice.recommended && (
                                  <Badge variant="secondary" className="text-xs">مستحسن</Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full mt-2"
                        onClick={() => previewVoice(selectedSegment.voice)}
                        disabled={showVoicePreview === selectedSegment.voice}
                      >
                        {showVoicePreview === selectedSegment.voice ? (
                          <>
                            <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin ml-1" />
                            جاري التشغيل...
                          </>
                        ) : (
                          <>
                            <Headphones size={14} className="ml-1" />
                            معاينة الصوت
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                )}

                <div>
                  <Label>المدة (ثانية)</Label>
                  <Input
                    type="number"
                    value={selectedSegment.duration}
                    onChange={(e) => updateSegment(selectedSegment.id, { duration: parseFloat(e.target.value) || 0 })}
                    min={0.1}
                    step={0.1}
                  />
                </div>

                <div>
                  <Label>سرعة التشغيل: {selectedSegment.speed}x</Label>
                  <Slider
                    value={[selectedSegment.speed]}
                    onValueChange={([value]) => updateSegment(selectedSegment.id, { speed: value })}
                    min={0.5}
                    max={2}
                    step={0.1}
                  />
                </div>

                <div>
                  <Label>نبرة الصوت: {selectedSegment.pitch}</Label>
                  <Slider
                    value={[selectedSegment.pitch]}
                    onValueChange={([value]) => updateSegment(selectedSegment.id, { pitch: value })}
                    min={0.5}
                    max={1.5}
                    step={0.1}
                  />
                </div>

                <div>
                  <Label>مستوى الصوت: {Math.round(selectedSegment.volume * 100)}%</Label>
                  <Slider
                    value={[selectedSegment.volume]}
                    onValueChange={([value]) => updateSegment(selectedSegment.id, { volume: value })}
                    min={0}
                    max={1}
                    step={0.05}
                  />
                </div>

                <Separator />
                
                <div className="space-y-3">
                  <Label>فترات الصمت</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-xs">قبل</Label>
                      <Input
                        type="number"
                        value={selectedSegment.pause.before}
                        onChange={(e) => updateSegment(selectedSegment.id, {
                          pause: { ...selectedSegment.pause, before: parseFloat(e.target.value) || 0 }
                        })}
                        min={0}
                        step={0.1}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">بعد</Label>
                      <Input
                        type="number"
                        value={selectedSegment.pause.after}
                        onChange={(e) => updateSegment(selectedSegment.id, {
                          pause: { ...selectedSegment.pause, after: parseFloat(e.target.value) || 0 }
                        })}
                        min={0}
                        step={0.1}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>التأثيرات الصوتية</Label>
                  
                  <div>
                    <Label className="text-xs">تلاشي الدخول (ثواني)</Label>
                    <Slider
                      value={[selectedSegment.effects.fade.in]}
                      onValueChange={([value]) => updateSegment(selectedSegment.id, {
                        effects: { ...selectedSegment.effects, fade: { ...selectedSegment.effects.fade, in: value } }
                      })}
                      min={0}
                      max={5}
                      step={0.1}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">تلاشي الخروج (ثواني)</Label>
                    <Slider
                      value={[selectedSegment.effects.fade.out]}
                      onValueChange={([value]) => updateSegment(selectedSegment.id, {
                        effects: { ...selectedSegment.effects, fade: { ...selectedSegment.effects.fade, out: value } }
                      })}
                      min={0}
                      max={5}
                      step={0.1}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">صدى: {selectedSegment.effects.echo}%</Label>
                    <Slider
                      value={[selectedSegment.effects.echo]}
                      onValueChange={([value]) => updateSegment(selectedSegment.id, {
                        effects: { ...selectedSegment.effects, echo: value }
                      })}
                      min={0}
                      max={100}
                      step={5}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={selectedSegment.effects.noise}
                      onCheckedChange={(checked) => updateSegment(selectedSegment.id, {
                        effects: { ...selectedSegment.effects, noise: checked }
                      })}
                    />
                    <Label className="mr-2 text-xs">إزالة الضوضاء</Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">اختر جزءاً لتعديل خصائصه</p>
              </CardContent>
            </Card>
          )}

          {/* Global Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إعدادات المشروع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>صيغة التصدير</Label>
                <Select 
                  value={currentProject.globalSettings.outputFormat}
                  onValueChange={(value: any) => setCurrentProject(prev => prev ? {
                    ...prev,
                    globalSettings: { ...prev.globalSettings, outputFormat: value }
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mp3">MP3</SelectItem>
                    <SelectItem value="wav">WAV</SelectItem>
                    <SelectItem value="aac">AAC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>جودة الصوت</Label>
                <Select 
                  value={currentProject.globalSettings.bitrate.toString()}
                  onValueChange={(value) => setCurrentProject(prev => prev ? {
                    ...prev,
                    globalSettings: { ...prev.globalSettings, bitrate: parseInt(value) as any }
                  } : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="128">128 kbps (جودة عادية)</SelectItem>
                    <SelectItem value="192">192 kbps (جودة جيدة)</SelectItem>
                    <SelectItem value="256">256 kbps (جودة عالية)</SelectItem>
                    <SelectItem value="320">320 kbps (جودة فائقة)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={currentProject.globalSettings.normalize}
                    onCheckedChange={(checked) => setCurrentProject(prev => prev ? {
                      ...prev,
                      globalSettings: { ...prev.globalSettings, normalize: checked }
                    } : null)}
                  />
                  <Label className="mr-2 text-sm">تطبيع مستوى الصوت</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={currentProject.globalSettings.limitPeaks}
                    onCheckedChange={(checked) => setCurrentProject(prev => prev ? {
                      ...prev,
                      globalSettings: { ...prev.globalSettings, limitPeaks: checked }
                    } : null)}
                  />
                  <Label className="mr-2 text-sm">تحديد القمم العالية</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}