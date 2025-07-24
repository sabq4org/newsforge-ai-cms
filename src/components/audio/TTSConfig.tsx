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
  Waveform,
  Microphone,
  Robot,
  Settings,
  VolumeHigh,
  Timer,
  FileAudio,
  Magic,
  Sparkles,
  SpeakerHigh,
  SpeakerLow,
  SpeakerX,
  Equalizer,
  Record,
  RecordFill,
  ArrowClockwise,
  CheckCircle,
  Warning,
  Info,
  X,
  Plus,
  Minus,
  FloppyDisk,
  Share,
  Copy,
  TextT,
  Translate,
  Globe
} from '@phosphor-icons/react';
import { AudioSegment } from '@/types';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TTSConfigProps {
  text: string;
  onTextChange: (text: string) => void;
  onAudioGenerated: (audioUrl: string, duration: number) => void;
  segment?: AudioSegment;
  isGenerating?: boolean;
}

interface Voice {
  id: string;
  name: string;
  nameEn: string;
  gender: 'male' | 'female';
  age: 'young' | 'adult' | 'mature';
  style: 'formal' | 'casual' | 'news' | 'friendly' | 'authoritative' | 'warm';
  language: 'ar' | 'en' | 'both';
  preview?: string;
  description: string;
  recommended: boolean;
}

interface TTSSettings {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  emphasis: number;
  pauseLength: number;
  breathing: boolean;
  naturalness: number;
  emotionalTone: 'neutral' | 'happy' | 'serious' | 'calm' | 'energetic' | 'concerned';
  pronunciation: {
    enabled: boolean;
    customWords: { word: string; pronunciation: string }[];
  };
  ssml: {
    enabled: boolean;
    customTags: boolean;
  };
}

interface TextAnalysis {
  wordCount: number;
  characterCount: number;
  estimatedDuration: number;
  difficulty: 'easy' | 'medium' | 'hard';
  readabilityScore: number;
  languageDetected: 'ar' | 'en' | 'mixed';
  issues: {
    type: 'pronunciation' | 'punctuation' | 'formatting' | 'length';
    message: string;
    suggestion: string;
    position?: { start: number; end: number };
  }[];
}

const ARABIC_VOICES: Voice[] = [
  {
    id: 'fahad_premium',
    name: 'فهد المحترف',
    nameEn: 'Fahad Professional',
    gender: 'male',
    age: 'adult',
    style: 'formal',
    language: 'ar',
    description: 'صوت رجالي عميق ومتميز، مثالي للنشرات الإخبارية والمحتوى الرسمي',
    recommended: true
  },
  {
    id: 'sara_news',
    name: 'سارة الإخبارية',
    nameEn: 'Sara News',
    gender: 'female',
    age: 'adult',
    style: 'news',
    language: 'ar',
    description: 'صوت إخباري واضح ومحترف للنشرات والتقارير',
    recommended: true
  },
  {
    id: 'ahmed_warm',
    name: 'أحمد الدافئ',
    nameEn: 'Ahmed Warm',
    gender: 'male',
    age: 'mature',
    style: 'warm',
    language: 'ar',
    description: 'صوت دافئ ومطمئن مناسب للمحتوى التعليمي والثقافي',
    recommended: false
  },
  {
    id: 'layla_modern',
    name: 'ليلى العصرية',
    nameEn: 'Layla Modern',
    gender: 'female',
    age: 'young',
    style: 'casual',
    language: 'ar',
    description: 'صوت شبابي حيوي مناسب للبودكاست والمحتوى غير الرسمي',
    recommended: false
  },
  {
    id: 'omar_authority',
    name: 'عمر السلطة',
    nameEn: 'Omar Authority',
    gender: 'male',
    age: 'mature',
    style: 'authoritative',
    language: 'ar',
    description: 'صوت موثوق وقوي للمحتوى الرسمي والتحليلات',
    recommended: false
  },
  {
    id: 'nour_gentle',
    name: 'نور الرقيقة',
    nameEn: 'Nour Gentle',
    gender: 'female',
    age: 'adult',
    style: 'friendly',
    language: 'ar',
    description: 'صوت رقيق وودود مناسب للمحتوى الاجتماعي والثقافي',
    recommended: false
  }
];

const EMOTIONAL_TONES = [
  { id: 'neutral', name: 'محايد', nameEn: 'Neutral', description: 'نبرة محايدة ومتوازنة' },
  { id: 'serious', name: 'جدي', nameEn: 'Serious', description: 'نبرة جدية ورسمية' },
  { id: 'calm', name: 'هادئ', nameEn: 'Calm', description: 'نبرة هادئة ومطمئنة' },
  { id: 'energetic', name: 'حيوي', nameEn: 'Energetic', description: 'نبرة حيوية ومتحمسة' },
  { id: 'concerned', name: 'مهتم', nameEn: 'Concerned', description: 'نبرة تظهر الاهتمام والقلق' },
  { id: 'happy', name: 'سعيد', nameEn: 'Happy', description: 'نبرة إيجابية ومتفائلة' }
];

export function TTSConfig({ text, onTextChange, onAudioGenerated, segment, isGenerating }: TTSConfigProps) {
  const { user } = useAuth();
  const [settings, setSettings] = useKV<TTSSettings>('sabq-tts-settings', {
    voice: 'fahad_premium',
    speed: 1.0,
    pitch: 1.0,
    volume: 0.8,
    emphasis: 0.5,
    pauseLength: 1.0,
    breathing: true,
    naturalness: 0.8,
    emotionalTone: 'neutral',
    pronunciation: {
      enabled: false,
      customWords: []
    },
    ssml: {
      enabled: false,
      customTags: false
    }
  });

  const [activeTab, setActiveTab] = useState('basic');
  const [textAnalysis, setTextAnalysis] = useState<TextAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [customWord, setCustomWord] = useState({ word: '', pronunciation: '' });
  const [ssmlEnabled, setSsmlEnabled] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Analyze text whenever it changes
  useEffect(() => {
    if (text.trim()) {
      analyzeText(text);
    }
  }, [text]);

  // Analyze text for TTS optimization
  const analyzeText = async (inputText: string) => {
    setIsAnalyzing(true);
    
    try {
      const prompt = spark.llmPrompt`Analyze this Arabic text for text-to-speech conversion:

Text: "${inputText}"

Provide analysis for:
1. Word count and character count
2. Estimated reading duration at normal speed
3. Reading difficulty level (easy/medium/hard)
4. Language detection (Arabic/English/Mixed)
5. Potential pronunciation issues
6. Punctuation and formatting suggestions
7. Readability score (1-100)

Return detailed analysis with specific suggestions for TTS optimization.`;

      const analysisResult = await spark.llm(prompt, 'gpt-4o', true);
      const analysis = JSON.parse(analysisResult);

      // Calculate basic metrics
      const wordCount = inputText.trim().split(/\s+/).length;
      const characterCount = inputText.length;
      const estimatedDuration = Math.ceil((wordCount / 150) * 60); // 150 words per minute average

      const textAnalysis: TextAnalysis = {
        wordCount,
        characterCount,
        estimatedDuration,
        difficulty: analysis.difficulty || 'medium',
        readabilityScore: analysis.readabilityScore || 75,
        languageDetected: analysis.languageDetected || 'ar',
        issues: analysis.issues || []
      };

      setTextAnalysis(textAnalysis);

    } catch (error) {
      console.error('Error analyzing text:', error);
      // Fallback analysis
      const wordCount = inputText.trim().split(/\s+/).length;
      const characterCount = inputText.length;
      const estimatedDuration = Math.ceil((wordCount / 150) * 60);

      setTextAnalysis({
        wordCount,
        characterCount,
        estimatedDuration,
        difficulty: 'medium',
        readabilityScore: 75,
        languageDetected: 'ar',
        issues: []
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate TTS audio
  const generateTTS = async () => {
    if (!text.trim()) {
      toast.error('يرجى إدخال النص أولاً');
      return;
    }

    setGenerationProgress(0);

    try {
      const selectedVoice = ARABIC_VOICES.find(v => v.id === settings.voice);
      
      // Step 1: Optimize text for TTS
      setGenerationProgress(20);
      const optimizationPrompt = spark.llmPrompt`Optimize this Arabic text for high-quality text-to-speech:

Text: "${text}"
Voice Style: ${selectedVoice?.style}
Emotional Tone: ${settings.emotionalTone}
Naturalness Level: ${settings.naturalness}

Instructions:
- Add appropriate pauses with [PAUSE:duration] markers
- Include breath marks [BREATH] where natural
- Adjust punctuation for better flow
- Add emphasis markers [EMPHASIS:word] for important words
- Ensure proper diacritics for clarity
- Optimize sentence structure for speech
- Handle numbers and abbreviations properly

Return the optimized text with SSML-like markers.`;

      const optimizedText = await spark.llm(optimizationPrompt);
      setGenerationProgress(50);

      // Step 2: Generate audio (simulated)
      await new Promise(resolve => setTimeout(resolve, 3000));
      setGenerationProgress(80);

      // Step 3: Apply audio effects
      await new Promise(resolve => setTimeout(resolve, 1000));
      setGenerationProgress(95);

      // Step 4: Finalize
      const audioUrl = `/generated/tts_${Date.now()}.mp3`;
      const duration = textAnalysis?.estimatedDuration || 60;

      setGenerationProgress(100);
      onAudioGenerated(audioUrl, duration);
      
      toast.success('تم توليد الصوت بنجاح');

    } catch (error) {
      console.error('Error generating TTS:', error);
      toast.error('حدث خطأ في توليد الصوت');
    } finally {
      setTimeout(() => setGenerationProgress(0), 1000);
    }
  };

  // Preview voice
  const previewVoice = async (voiceId: string) => {
    const voice = ARABIC_VOICES.find(v => v.id === voiceId);
    if (!voice) return;

    setPreviewPlaying(true);
    toast.info(`معاينة صوت: ${voice.name}`);
    
    // Simulate preview playback
    setTimeout(() => {
      setPreviewPlaying(false);
    }, 3000);
  };

  // Add custom pronunciation
  const addCustomPronunciation = () => {
    if (!customWord.word || !customWord.pronunciation) return;

    setSettings(prev => ({
      ...prev,
      pronunciation: {
        ...prev.pronunciation,
        customWords: [
          ...prev.pronunciation.customWords,
          { ...customWord }
        ]
      }
    }));

    setCustomWord({ word: '', pronunciation: '' });
    toast.success('تم إضافة النطق المخصص');
  };

  // Remove custom pronunciation
  const removeCustomPronunciation = (index: number) => {
    setSettings(prev => ({
      ...prev,
      pronunciation: {
        ...prev.pronunciation,
        customWords: prev.pronunciation.customWords.filter((_, i) => i !== index)
      }
    }));
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
          <h2 className="text-2xl font-bold">إعدادات تحويل النص إلى كلام</h2>
          <p className="text-muted-foreground">تخصيص متقدم لجودة الصوت المولد</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setSettings({
              voice: 'fahad_premium',
              speed: 1.0,
              pitch: 1.0,
              volume: 0.8,
              emphasis: 0.5,
              pauseLength: 1.0,
              breathing: true,
              naturalness: 0.8,
              emotionalTone: 'neutral',
              pronunciation: { enabled: false, customWords: [] },
              ssml: { enabled: false, customTags: false }
            })}
          >
            <ArrowClockwise className="ml-2" size={16} />
            إعادة تعيين
          </Button>
          
          <Button onClick={generateTTS} disabled={isGenerating || !text.trim()}>
            <Magic className="ml-2" size={16} />
            {isGenerating ? 'جاري التوليد...' : 'توليد الصوت'}
          </Button>
        </div>
      </div>

      {/* Generation Progress */}
      {generationProgress > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">جاري توليد الصوت...</span>
                <span className="text-sm">{generationProgress}%</span>
              </div>
              <Progress value={generationProgress} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Text Input and Analysis */}
        <div className="col-span-2 space-y-4">
          {/* Text Input */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TextT size={20} />
                النص المراد تحويله
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                placeholder="اكتب أو الصق النص هنا..."
                rows={8}
                className="resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {textAnalysis && (
                    <>
                      <span>{textAnalysis.wordCount} كلمة</span>
                      <span>{textAnalysis.characterCount} حرف</span>
                      <span>المدة المتوقعة: {formatDuration(textAnalysis.estimatedDuration)}</span>
                    </>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Upload className="ml-1" size={14} />
                    رفع ملف
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="ml-1" size={14} />
                    نسخ
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Text Analysis */}
          {textAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info size={20} />
                  تحليل النص
                  {isAnalyzing && <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{textAnalysis.wordCount}</div>
                    <div className="text-xs text-muted-foreground">كلمة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{formatDuration(textAnalysis.estimatedDuration)}</div>
                    <div className="text-xs text-muted-foreground">مدة متوقعة</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{textAnalysis.readabilityScore}</div>
                    <div className="text-xs text-muted-foreground">سهولة القراءة</div>
                  </div>
                  <div className="text-center">
                    <Badge variant={
                      textAnalysis.difficulty === 'easy' ? 'default' :
                      textAnalysis.difficulty === 'medium' ? 'secondary' : 'destructive'
                    }>
                      {textAnalysis.difficulty === 'easy' ? 'سهل' :
                       textAnalysis.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                    </Badge>
                  </div>
                </div>

                {textAnalysis.issues.length > 0 && (
                  <div className="space-y-2">
                    <Label>ملاحظات وتحسينات</Label>
                    <ScrollArea className="h-24">
                      <div className="space-y-1">
                        {textAnalysis.issues.map((issue, index) => (
                          <div key={index} className="flex items-start gap-2 text-sm p-2 bg-muted rounded">
                            <Warning size={14} className="text-amber-500 mt-0.5" />
                            <div>
                              <p className="font-medium">{issue.message}</p>
                              <p className="text-muted-foreground text-xs">{issue.suggestion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Settings Panel */}
        <div className="space-y-4">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>الإعدادات الأساسية</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>الصوت</Label>
                <Select value={settings.voice} onValueChange={(value) => 
                  setSettings(prev => ({ ...prev, voice: value }))
                }>
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
                  onClick={() => previewVoice(settings.voice)}
                  disabled={previewPlaying}
                >
                  {previewPlaying ? <Pause size={14} /> : <Play size={14} />}
                  <span className="mr-1">معاينة</span>
                </Button>
              </div>

              <div>
                <Label>السرعة: {settings.speed}x</Label>
                <Slider
                  value={[settings.speed]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, speed: value }))}
                  min={0.5}
                  max={2}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>طبقة الصوت: {settings.pitch}</Label>
                <Slider
                  value={[settings.pitch]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, pitch: value }))}
                  min={0.5}
                  max={1.5}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>مستوى الصوت: {Math.round(settings.volume * 100)}%</Label>
                <Slider
                  value={[settings.volume]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, volume: value }))}
                  min={0}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>النبرة العاطفية</Label>
                <Select value={settings.emotionalTone} onValueChange={(value: any) => 
                  setSettings(prev => ({ ...prev, emotionalTone: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EMOTIONAL_TONES.map(tone => (
                      <SelectItem key={tone.id} value={tone.id}>
                        {tone.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Advanced Settings */}
          <Card>
            <CardHeader>
              <CardTitle>إعدادات متقدمة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>الطبيعية: {Math.round(settings.naturalness * 100)}%</Label>
                <Slider
                  value={[settings.naturalness]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, naturalness: value }))}
                  min={0}
                  max={1}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>طول فترات الصمت: {settings.pauseLength}ث</Label>
                <Slider
                  value={[settings.pauseLength]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, pauseLength: value }))}
                  min={0.1}
                  max={3}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>التأكيد: {Math.round(settings.emphasis * 100)}%</Label>
                <Slider
                  value={[settings.emphasis]}
                  onValueChange={([value]) => setSettings(prev => ({ ...prev, emphasis: value }))}
                  min={0}
                  max={1}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.breathing}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, breathing: checked }))}
                />
                <Label className="mr-2">أصوات التنفس الطبيعية</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.pronunciation.enabled}
                  onCheckedChange={(checked) => setSettings(prev => ({
                    ...prev,
                    pronunciation: { ...prev.pronunciation, enabled: checked }
                  }))}
                />
                <Label className="mr-2">نطق مخصص للكلمات</Label>
              </div>
            </CardContent>
          </Card>

          {/* Custom Pronunciation */}
          {settings.pronunciation.enabled && (
            <Card>
              <CardHeader>
                <CardTitle>النطق المخصص</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Input
                    placeholder="الكلمة"
                    value={customWord.word}
                    onChange={(e) => setCustomWord(prev => ({ ...prev, word: e.target.value }))}
                  />
                  <Input
                    placeholder="النطق الصحيح"
                    value={customWord.pronunciation}
                    onChange={(e) => setCustomWord(prev => ({ ...prev, pronunciation: e.target.value }))}
                  />
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={addCustomPronunciation}
                    disabled={!customWord.word || !customWord.pronunciation}
                  >
                    <Plus className="ml-1" size={14} />
                    إضافة
                  </Button>
                </div>

                {settings.pronunciation.customWords.length > 0 && (
                  <ScrollArea className="h-24">
                    <div className="space-y-1">
                      {settings.pronunciation.customWords.map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                          <div>
                            <span className="font-medium">{item.word}</span>
                            <span className="text-muted-foreground mr-2">→ {item.pronunciation}</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => removeCustomPronunciation(index)}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Hidden audio element */}
      <audio ref={audioRef} />
    </div>
  );
}