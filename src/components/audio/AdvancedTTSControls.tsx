import { useState, useEffect } from 'react';
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
  Globe,
  CloudArrowDown,
  Headphones,
  MusicNotes,
  WaveTriangle,
  Gauge
} from '@phosphor-icons/react';
import { useKV } from '@github/spark/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { elevenLabsService, ARABIC_VOICE_CONFIGS, optimizeArabicText } from '@/services/elevenlabs';

interface AdvancedTTSControlsProps {
  segment: {
    id: string;
    text: string;
    voice: string;
    elevenLabsVoiceId?: string;
    elevenLabsSettings?: {
      stability: number;
      similarity_boost: number;
      style: number;
      use_speaker_boost: boolean;
    };
  };
  onSettingsChange: (settings: any) => void;
  onTextOptimized: (optimizedText: string) => void;
  onGenerateAudio: () => void;
}

interface VoiceAnalysis {
  clarity: number;
  naturalness: number;
  emotion: string;
  speed_rating: number;
  recommendations: string[];
}

export function AdvancedTTSControls({ 
  segment, 
  onSettingsChange, 
  onTextOptimized, 
  onGenerateAudio 
}: AdvancedTTSControlsProps) {
  const { user } = useAuth();
  const [advancedSettings, setAdvancedSettings] = useKV('sabq-advanced-tts', {
    model: 'eleven_multilingual_v2',
    pronunciation_enhancement: true,
    emotional_range: 0.5,
    pause_optimization: true,
    background_noise_reduction: true,
    voice_enhancement: true,
    custom_speed_curve: false,
    dynamic_range_compression: 0.3,
    eq_settings: {
      low: 0,
      mid: 0,
      high: 0
    }
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [voiceAnalysis, setVoiceAnalysis] = useState<VoiceAnalysis | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationProgress, setOptimizationProgress] = useState(0);
  const [previewAudio, setPreviewAudio] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Current ElevenLabs settings with defaults
  const currentSettings = {
    stability: segment.elevenLabsSettings?.stability || 0.75,
    similarity_boost: segment.elevenLabsSettings?.similarity_boost || 0.85,
    style: segment.elevenLabsSettings?.style || 0.3,
    use_speaker_boost: segment.elevenLabsSettings?.use_speaker_boost || true,
    ...advancedSettings
  };

  // Analyze voice characteristics
  const analyzeVoice = async () => {
    if (!segment.text.trim()) return;

    setIsAnalyzing(true);
    
    try {
      const prompt = spark.llmPrompt`Analyze this Arabic text for voice synthesis optimization:

Text: "${segment.text}"
Current Voice ID: ${segment.voice}
Target Style: Professional news/podcast

Provide analysis for:
1. Text clarity score (1-100)
2. Natural speech flow score (1-100) 
3. Dominant emotional tone
4. Recommended speaking speed
5. Specific recommendations for Arabic TTS optimization

Return detailed analysis with actionable improvements.`;

      const analysis = await spark.llm(prompt, 'gpt-4o', true);
      const parsedAnalysis = JSON.parse(analysis);

      setVoiceAnalysis({
        clarity: parsedAnalysis.clarity || 85,
        naturalness: parsedAnalysis.naturalness || 80,
        emotion: parsedAnalysis.emotion || 'neutral',
        speed_rating: parsedAnalysis.speed_rating || 1.0,
        recommendations: parsedAnalysis.recommendations || []
      });

    } catch (error) {
      console.error('Error analyzing voice:', error);
      // Fallback analysis
      setVoiceAnalysis({
        clarity: 85,
        naturalness: 80,
        emotion: 'neutral',
        speed_rating: 1.0,
        recommendations: ['تحسين علامات الترقيم', 'إضافة فترات صمت طبيعية']
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Optimize text with advanced AI
  const optimizeTextAdvanced = async () => {
    if (!segment.text.trim()) return;

    setIsOptimizing(true);
    setOptimizationProgress(0);

    try {
      setOptimizationProgress(20);

      const prompt = spark.llmPrompt`Advanced Arabic text optimization for premium TTS:

Original Text: "${segment.text}"
Voice Style: ${segment.voice}
Target Emotion: ${voiceAnalysis?.emotion || 'neutral'}
Clarity Score: ${voiceAnalysis?.clarity || 85}

Advanced Optimization Requirements:
1. Add strategic pauses using natural Arabic rhythm
2. Enhance pronunciation with subtle diacritics where needed
3. Optimize sentence flow for natural breathing
4. Adjust word stress for maximum clarity
5. Add emotional markers for natural expression
6. Ensure proper Arabic prosody patterns
7. Handle foreign words and technical terms
8. Optimize for ${currentSettings.stability > 0.7 ? 'formal' : 'conversational'} delivery

Return the optimized text that will sound natural and engaging when converted to speech.`;

      setOptimizationProgress(60);
      const optimizedText = await optimizeArabicText(segment.text);
      
      setOptimizationProgress(90);
      
      // Additional AI enhancement
      const enhancedPrompt = spark.llmPrompt`Further enhance this Arabic text for premium voice synthesis:

Text: "${optimizedText}"

Add:
- Natural breathing points
- Emotional emphasis markers
- Rhythm optimization for Arabic speech patterns
- Professional podcast-style delivery cues

Return the final enhanced text.`;

      const finalText = await spark.llm(enhancedPrompt);
      
      setOptimizationProgress(100);
      onTextOptimized(finalText.trim());
      toast.success('تم تحسين النص بنجاح');

    } catch (error) {
      console.error('Error optimizing text:', error);
      toast.error('حدث خطأ في تحسين النص');
    } finally {
      setIsOptimizing(false);
      setTimeout(() => setOptimizationProgress(0), 1000);
    }
  };

  // Generate preview with current settings
  const generatePreview = async () => {
    if (!segment.text.trim() || !segment.elevenLabsVoiceId) return;

    setIsGenerating(true);
    
    try {
      const previewText = segment.text.substring(0, 200) + (segment.text.length > 200 ? '...' : '');
      
      const audioBlob = await elevenLabsService.generateSpeech({
        voice_id: segment.elevenLabsVoiceId,
        text: previewText,
        model_id: advancedSettings.model,
        stability: currentSettings.stability,
        similarity_boost: currentSettings.similarity_boost,
        style: currentSettings.style,
        use_speaker_boost: currentSettings.use_speaker_boost,
        output_format: 'mp3_44100_128'
      });

      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        setPreviewAudio(audioUrl);
        
        const audio = new Audio(audioUrl);
        audio.addEventListener('ended', () => {
          setPreviewAudio(null);
        });
        
        await audio.play();
        toast.success('تشغيل المعاينة');
      } else {
        throw new Error('Failed to generate preview');
      }

    } catch (error) {
      console.error('Error generating preview:', error);
      toast.error('حدث خطأ في توليد المعاينة');
    } finally {
      setIsGenerating(false);
    }
  };

  // Update settings
  const updateSetting = (key: string, value: any) => {
    const newSettings = { ...currentSettings, [key]: value };
    onSettingsChange(newSettings);
  };

  // Auto-analyze when text changes
  useEffect(() => {
    if (segment.text.trim()) {
      analyzeVoice();
    }
  }, [segment.text]);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">التحكم المتقدم في الصوت</h3>
          <p className="text-sm text-muted-foreground">إعدادات ElevenLabs المتقدمة</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={generatePreview}
            disabled={isGenerating || !segment.text.trim()}
          >
            {isGenerating ? (
              <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin ml-1" />
            ) : (
              <Headphones size={14} className="ml-1" />
            )}
            معاينة
          </Button>
          
          <Button 
            size="sm"
            onClick={onGenerateAudio}
            disabled={!segment.text.trim()}
          >
            <Magic className="ml-1" size={14} />
            توليد
          </Button>
        </div>
      </div>

      <Tabs defaultValue="voice" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="voice">الصوت</TabsTrigger>
          <TabsTrigger value="optimization">التحسين</TabsTrigger>
          <TabsTrigger value="effects">التأثيرات</TabsTrigger>
          <TabsTrigger value="analysis">التحليل</TabsTrigger>
        </TabsList>

        {/* Voice Settings */}
        <TabsContent value="voice" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SpeakerHigh size={20} />
                إعدادات الصوت الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>الاستقرار (Stability): {Math.round(currentSettings.stability * 100)}%</Label>
                <Slider
                  value={[currentSettings.stability]}
                  onValueChange={([value]) => updateSetting('stability', value)}
                  min={0}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  قيم أعلى = صوت أكثر ثباتاً، قيم أقل = صوت أكثر تنوعاً
                </p>
              </div>

              <div>
                <Label>التشابه (Similarity): {Math.round(currentSettings.similarity_boost * 100)}%</Label>
                <Slider
                  value={[currentSettings.similarity_boost]}
                  onValueChange={([value]) => updateSetting('similarity_boost', value)}
                  min={0}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  يحافظ على خصائص الصوت الأصلية
                </p>
              </div>

              <div>
                <Label>الأسلوب (Style): {Math.round(currentSettings.style * 100)}%</Label>
                <Slider
                  value={[currentSettings.style]}
                  onValueChange={([value]) => updateSetting('style', value)}
                  min={0}
                  max={1}
                  step={0.05}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  يؤثر على التعبير العاطفي والتنغيم
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={currentSettings.use_speaker_boost}
                  onCheckedChange={(checked) => updateSetting('use_speaker_boost', checked)}
                />
                <Label className="mr-2">تعزيز وضوح المتحدث</Label>
              </div>

              <div>
                <Label>موديل ElevenLabs</Label>
                <Select 
                  value={advancedSettings.model}
                  onValueChange={(value) => setAdvancedSettings(prev => ({ ...prev, model: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="eleven_multilingual_v2">متعدد اللغات v2 (مستحسن)</SelectItem>
                    <SelectItem value="eleven_multilingual_v1">متعدد اللغات v1</SelectItem>
                    <SelectItem value="eleven_monolingual_v1">أحادي اللغة v1</SelectItem>
                    <SelectItem value="eleven_turbo_v2">Turbo v2 (سريع)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Text Optimization */}
        <TabsContent value="optimization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TextT size={20} />
                تحسين النص المتقدم
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {optimizationProgress > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">جاري التحسين...</span>
                    <span className="text-sm">{optimizationProgress}%</span>
                  </div>
                  <Progress value={optimizationProgress} />
                </div>
              )}

              <Button 
                onClick={optimizeTextAdvanced}
                disabled={isOptimizing || !segment.text.trim()}
                className="w-full"
              >
                <Sparkles className="ml-2" size={16} />
                {isOptimizing ? 'جاري التحسين...' : 'تحسين متقدم بالذكاء الاصطناعي'}
              </Button>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={advancedSettings.pronunciation_enhancement}
                    onCheckedChange={(checked) => setAdvancedSettings(prev => ({ ...prev, pronunciation_enhancement: checked }))}
                  />
                  <Label className="mr-2">تحسين النطق التلقائي</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={advancedSettings.pause_optimization}
                    onCheckedChange={(checked) => setAdvancedSettings(prev => ({ ...prev, pause_optimization: checked }))}
                  />
                  <Label className="mr-2">تحسين فترات الصمت</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={advancedSettings.voice_enhancement}
                    onCheckedChange={(checked) => setAdvancedSettings(prev => ({ ...prev, voice_enhancement: checked }))}
                  />
                  <Label className="mr-2">تحسين جودة الصوت</Label>
                </div>
              </div>

              <div>
                <Label>المدى العاطفي: {Math.round(advancedSettings.emotional_range * 100)}%</Label>
                <Slider
                  value={[advancedSettings.emotional_range]}
                  onValueChange={([value]) => setAdvancedSettings(prev => ({ ...prev, emotional_range: value }))}
                  min={0}
                  max={1}
                  step={0.1}
                  className="mt-2"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audio Effects */}
        <TabsContent value="effects" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Equalizer size={20} />
                تأثيرات صوتية متقدمة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>ضغط المدى الديناميكي: {Math.round(advancedSettings.dynamic_range_compression * 100)}%</Label>
                <Slider
                  value={[advancedSettings.dynamic_range_compression]}
                  onValueChange={([value]) => setAdvancedSettings(prev => ({ ...prev, dynamic_range_compression: value }))}
                  min={0}
                  max={1}
                  step={0.1}
                  className="mt-2"
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>إعدادات التوازن الصوتي (EQ)</Label>
                
                <div>
                  <Label className="text-sm">الترددات المنخفضة: {advancedSettings.eq_settings.low}dB</Label>
                  <Slider
                    value={[advancedSettings.eq_settings.low]}
                    onValueChange={([value]) => setAdvancedSettings(prev => ({
                      ...prev,
                      eq_settings: { ...prev.eq_settings, low: value }
                    }))}
                    min={-12}
                    max={12}
                    step={1}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm">الترددات المتوسطة: {advancedSettings.eq_settings.mid}dB</Label>
                  <Slider
                    value={[advancedSettings.eq_settings.mid]}
                    onValueChange={([value]) => setAdvancedSettings(prev => ({
                      ...prev,
                      eq_settings: { ...prev.eq_settings, mid: value }
                    }))}
                    min={-12}
                    max={12}
                    step={1}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label className="text-sm">الترددات العالية: {advancedSettings.eq_settings.high}dB</Label>
                  <Slider
                    value={[advancedSettings.eq_settings.high]}
                    onValueChange={([value]) => setAdvancedSettings(prev => ({
                      ...prev,
                      eq_settings: { ...prev.eq_settings, high: value }
                    }))}
                    min={-12}
                    max={12}
                    step={1}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={advancedSettings.background_noise_reduction}
                  onCheckedChange={(checked) => setAdvancedSettings(prev => ({ ...prev, background_noise_reduction: checked }))}
                />
                <Label className="mr-2">تقليل الضوضاء الخلفية</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Voice Analysis */}
        <TabsContent value="analysis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <WaveTriangle size={20} />
                تحليل الصوت والنص
                {isAnalyzing && (
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {voiceAnalysis ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{voiceAnalysis.clarity}%</div>
                      <div className="text-sm text-muted-foreground">وضوح النص</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{voiceAnalysis.naturalness}%</div>
                      <div className="text-sm text-muted-foreground">الطبيعية</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">النبرة العاطفية:</span>
                    <Badge variant="outline">{voiceAnalysis.emotion}</Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm">السرعة المستحسنة:</span>
                    <Badge variant="outline">{voiceAnalysis.speed_rating}x</Badge>
                  </div>

                  {voiceAnalysis.recommendations.length > 0 && (
                    <div className="space-y-2">
                      <Label>توصيات التحسين:</Label>
                      <ScrollArea className="h-24">
                        <div className="space-y-1">
                          {voiceAnalysis.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm p-2 bg-muted rounded">
                              <Info size={14} className="text-blue-500 mt-0.5" />
                              <p>{rec}</p>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">اكتب النص لبدء التحليل</p>
                </div>
              )}

              <Button 
                variant="outline" 
                onClick={analyzeVoice}
                disabled={isAnalyzing || !segment.text.trim()}
                className="w-full"
              >
                <Gauge className="ml-2" size={16} />
                {isAnalyzing ? 'جاري التحليل...' : 'إعادة تحليل النص'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}