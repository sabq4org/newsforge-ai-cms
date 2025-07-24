import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SafeIcon } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { DailyDose, Article } from '@/types';
import { 
  Play, 
  Pause,
  Share,
  Download,
  Eye,
  Clock,
  Sparkles,
  FileText,
  TrendingUp,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Edit,
  Volume2,
  VolumeX,
  SkipForward,
  SkipBack
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { safeDateFormat } from '@/lib/utils';

interface DoseViewerProps {
  dose: DailyDose;
  articles: Article[];
  onClose: () => void;
  onEdit: () => void;
}

export function DoseViewer({ dose, articles, onClose, onEdit }: DoseViewerProps) {
  const { language } = useAuth();
  const isRTL = language.direction === 'rtl';
  const isArabic = language.code === 'ar';

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  // Get time slot icon and info
  const timeSlotInfo = {
    morning: { icon: Sun, emoji: '☀️', color: 'text-yellow-600' },
    noon: { icon: CloudSun, emoji: '☁️', color: 'text-blue-600' },
    evening: { icon: Sunset, emoji: '🌇', color: 'text-orange-600' },
    night: { icon: Moon, emoji: '🌙', color: 'text-purple-600' }
  };

  const info = timeSlotInfo[dose.timeSlot];
  const IconComponent = info.icon;

  // Get dose articles
  const doseArticles = articles.filter(article => 
    dose.content.articles.includes(article.id)
  );

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: dose.headline.textAr,
          text: dose.content.summaryAr,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success(
          isArabic ? 'تم نسخ الرابط' : 'Link copied to clipboard'
        );
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = () => {
    // In real implementation, would download audio file
    toast.success(
      isArabic ? 'تم بدء التحميل' : 'Download started'
    );
  };

  const toggleAudio = () => {
    setIsPlaying(!isPlaying);
    // In real implementation, would control actual audio playback
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className={cn("flex items-center gap-3 font-arabic", isRTL && "flex-row-reverse")}>
            <SafeIcon icon={IconComponent} className={cn("h-6 w-6", info.color)} />
            <span className="text-lg">{info.emoji}</span>
            <span>{dose.headline.textAr}</span>
            <Badge variant="secondary" className="font-arabic">
              {safeDateFormat(dose.date, isArabic ? 'ar-SA' : 'en-US')}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[70vh]">
          <div className="space-y-6 p-1">
            {/* Header Actions */}
            <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Badge variant="outline" className="font-arabic">
                  {dose.status === 'published' 
                    ? (isArabic ? 'منشورة' : 'Published')
                    : (isArabic ? 'مسودة' : 'Draft')
                  }
                </Badge>
                <Badge variant="outline" className="font-arabic">
                  {dose.generatedBy === 'ai' 
                    ? (isArabic ? 'ذكاء اصطناعي' : 'AI Generated')
                    : (isArabic ? 'يدوي' : 'Manual')
                  }
                </Badge>
              </div>
              <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                <Button variant="outline" size="sm" onClick={handleShare} className="font-arabic">
                  <SafeIcon icon={Share} className="h-4 w-4" />
                  {isArabic ? 'مشاركة' : 'Share'}
                </Button>
                <Button variant="outline" size="sm" onClick={onEdit} className="font-arabic">
                  <SafeIcon icon={Edit} className="h-4 w-4" />
                  {isArabic ? 'تحرير' : 'Edit'}
                </Button>
              </div>
            </div>

            {/* Main Content */}
            <Card>
              <CardHeader>
                <CardTitle className={cn("text-xl font-arabic", isRTL && "text-right")}>
                  {dose.headline.textAr}
                </CardTitle>
                <p className={cn("text-muted-foreground font-arabic", isRTL && "text-right")}>
                  {dose.subheadline.textAr}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Summary */}
                <div className={cn("prose max-w-none", isRTL && "text-right")}>
                  <p className="font-arabic leading-relaxed">
                    {dose.content.summaryAr}
                  </p>
                </div>

                {/* Audio Player */}
                {dose.audioContent && (
                  <Card className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className={cn("flex items-center gap-4", isRTL && "flex-row-reverse")}>
                        <Button
                          size="sm"
                          variant={isPlaying ? "default" : "outline"}
                          onClick={toggleAudio}
                        >
                          <SafeIcon icon={isPlaying ? Pause : Play} className="h-4 w-4" />
                        </Button>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-muted-foreground font-arabic">
                              {isArabic ? 'النسخة الصوتية' : 'Audio Version'}
                            </span>
                            <span className="text-sm font-mono">
                              {formatDuration(currentTime)} / {formatDuration(dose.audioContent.duration)}
                            </span>
                          </div>
                          <div className="w-full bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary rounded-full h-2 transition-all duration-300"
                              style={{ width: `${(currentTime / dose.audioContent.duration) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <Button size="sm" variant="ghost">
                            <SafeIcon icon={SkipBack} className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => setIsMuted(!isMuted)}
                          >
                            <SafeIcon icon={isMuted ? VolumeX : Volume2} className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <SafeIcon icon={SkipForward} className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={handleDownload}>
                            <SafeIcon icon={Download} className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Insights */}
                {dose.content.insights.length > 0 && (
                  <div className="space-y-2">
                    <h4 className={cn("font-medium text-sm flex items-center gap-2 font-arabic", isRTL && "flex-row-reverse")}>
                      <SafeIcon icon={TrendingUp} className="h-4 w-4 text-blue-600" />
                      {isArabic ? 'رؤى ذكية' : 'Smart Insights'}
                    </h4>
                    <div className="space-y-1">
                      {dose.content.insights.map((insight, index) => (
                        <div key={index} className={cn("text-sm text-muted-foreground font-arabic", isRTL && "text-right")}>
                          • {insight}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tip */}
                {dose.content.tip && (
                  <Card className="bg-accent/10 border-accent/20">
                    <CardContent className="p-3">
                      <div className={cn("flex items-start gap-3", isRTL && "flex-row-reverse")}>
                        <SafeIcon icon={Sparkles} className="h-4 w-4 text-accent mt-0.5" />
                        <div className={cn("space-y-1", isRTL && "text-right")}>
                          <h5 className="font-medium text-sm font-arabic">
                            {isArabic ? 'نصيحة اليوم' : 'Tip of the Day'}
                          </h5>
                          <p className="text-sm font-arabic">
                            {isArabic ? dose.content.tipAr : dose.content.tip}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>

            {/* Related Articles */}
            {doseArticles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className={cn("text-lg flex items-center gap-2 font-arabic", isRTL && "flex-row-reverse")}>
                    <SafeIcon icon={FileText} className="h-5 w-5" />
                    {isArabic ? 'المقالات المرتبطة' : 'Related Articles'}
                    <Badge variant="secondary" className="font-arabic">
                      {doseArticles.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {doseArticles.map((article) => (
                      <div key={article.id} className={cn("flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors", isRTL && "flex-row-reverse")}>
                        {article.featuredImage && (
                          <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                            <img 
                              src={article.featuredImage} 
                              alt={article.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className={cn("flex-1 space-y-1", isRTL && "text-right")}>
                          <h6 className="font-medium text-sm font-arabic line-clamp-2">
                            {article.title}
                          </h6>
                          <p className="text-xs text-muted-foreground font-arabic line-clamp-2">
                            {article.excerpt}
                          </p>
                          <div className={cn("flex items-center gap-3 text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
                            <span className="font-arabic">{article.category.nameAr}</span>
                            <span className="font-arabic">{article.analytics.views.toLocaleString()} {isArabic ? 'مشاهدة' : 'views'}</span>
                            <span className="font-arabic">{safeDateFormat(article.createdAt, isArabic ? 'ar-SA' : 'en-US')}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className={cn("text-lg flex items-center gap-2 font-arabic", isRTL && "flex-row-reverse")}>
                  <SafeIcon icon={Eye} className="h-5 w-5" />
                  {isArabic ? 'إحصائيات الأداء' : 'Performance Analytics'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={cn("text-center", isRTL && "text-right")}>
                    <div className="text-2xl font-bold text-blue-600 font-arabic">
                      {dose.analytics.views.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground font-arabic">
                      {isArabic ? 'مشاهدة' : 'Views'}
                    </div>
                  </div>
                  <div className={cn("text-center", isRTL && "text-right")}>
                    <div className="text-2xl font-bold text-green-600 font-arabic">
                      {dose.analytics.shares.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground font-arabic">
                      {isArabic ? 'مشاركة' : 'Shares'}
                    </div>
                  </div>
                  <div className={cn("text-center", isRTL && "text-right")}>
                    <div className="text-2xl font-bold text-purple-600 font-arabic">
                      {dose.analytics.audioPlays.toLocaleString()}
                    </div>
                    <div className="text-xs text-muted-foreground font-arabic">
                      {isArabic ? 'تشغيل صوتي' : 'Audio Plays'}
                    </div>
                  </div>
                  <div className={cn("text-center", isRTL && "text-right")}>
                    <div className="text-2xl font-bold text-orange-600 font-arabic">
                      {Math.round(dose.analytics.averageReadTime)}s
                    </div>
                    <div className="text-xs text-muted-foreground font-arabic">
                      {isArabic ? 'متوسط القراءة' : 'Read Time'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metadata */}
            <Card>
              <CardHeader>
                <CardTitle className={cn("text-lg flex items-center gap-2 font-arabic", isRTL && "flex-row-reverse")}>
                  <SafeIcon icon={Clock} className="h-5 w-5" />
                  {isArabic ? 'معلومات التوليد' : 'Generation Metadata'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className={cn("grid grid-cols-2 gap-4 text-sm", isRTL && "text-right")}>
                    <div>
                      <span className="text-muted-foreground font-arabic">
                        {isArabic ? 'تاريخ الإنشاء:' : 'Created:'}
                      </span>
                      <div className="font-arabic">
                        {safeDateFormat(dose.createdAt, isArabic ? 'ar-SA' : 'en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-arabic">
                        {isArabic ? 'تاريخ النشر:' : 'Published:'}
                      </span>
                      <div className="font-arabic">
                        {dose.publishedAt 
                          ? safeDateFormat(dose.publishedAt, isArabic ? 'ar-SA' : 'en-US', { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric', 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })
                          : (isArabic ? 'غير منشور' : 'Not published')
                        }
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-arabic">
                        {isArabic ? 'نموذج الذكاء الاصطناعي:' : 'AI Model:'}
                      </span>
                      <div className="font-arabic">
                        {dose.metadata.aiModel || (isArabic ? 'غير محدد' : 'Not specified')}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-arabic">
                        {isArabic ? 'وقت المعالجة:' : 'Processing Time:'}
                      </span>
                      <div className="font-arabic">
                        {dose.metadata.processingTime 
                          ? `${dose.metadata.processingTime}s`
                          : (isArabic ? 'غير محدد' : 'Not specified')
                        }
                      </div>
                    </div>
                  </div>

                  {dose.metadata.sourceArticles.length > 0 && (
                    <div className="space-y-2">
                      <h5 className={cn("font-medium text-sm font-arabic", isRTL && "text-right")}>
                        {isArabic ? 'المقالات المصدر:' : 'Source Articles:'}
                      </h5>
                      <div className="space-y-1">
                        {dose.metadata.sourceArticles.map((source, index) => (
                          <div 
                            key={index} 
                            className={cn("flex items-center justify-between text-xs", isRTL && "flex-row-reverse")}
                          >
                            <span className="font-arabic truncate">{source.title}</span>
                            <Badge variant="outline" className="text-xs font-arabic">
                              {Math.round(source.weight * 100)}%
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}