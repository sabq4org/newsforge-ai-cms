import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { SafeIcon } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { DosePhrase } from '@/types';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Download,
  Upload,
  Search,
  Filter,
  TrendingUp,
  Sun,
  CloudSun,
  Sunset,
  Moon,
  Save,
  X
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { safeDateFormat } from '@/lib/utils';

interface PhraseLibraryProps {
  phrases: DosePhrase[];
  onPhrasesUpdate: (phrases: DosePhrase[]) => void;
}

export function PhraseLibrary({ phrases, onPhrasesUpdate }: PhraseLibraryProps) {
  const { language } = useAuth();
  const isRTL = language.direction === 'rtl';
  const isArabic = language.code === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPhrase, setEditingPhrase] = useState<DosePhrase | null>(null);

  // Time slot icons and info
  const timeSlotInfo = {
    morning: { icon: Sun, emoji: '☀️', label: isArabic ? 'الصباح' : 'Morning', color: 'text-yellow-600' },
    noon: { icon: CloudSun, emoji: '☁️', label: isArabic ? 'الظهيرة' : 'Noon', color: 'text-blue-600' },
    evening: { icon: Sunset, emoji: '🌇', label: isArabic ? 'المساء' : 'Evening', color: 'text-orange-600' },
    night: { icon: Moon, emoji: '🌙', label: isArabic ? 'الليل' : 'Night', color: 'text-purple-600' }
  };

  // Filter phrases
  const filteredPhrases = phrases.filter(phrase => {
    const matchesSearch = searchQuery === '' || 
      phrase.textAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      phrase.text.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || phrase.category === selectedCategory;
    const matchesType = selectedType === 'all' || phrase.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  // Group by category and type
  const groupedPhrases = filteredPhrases.reduce((acc, phrase) => {
    const key = `${phrase.category}-${phrase.type}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(phrase);
    return acc;
  }, {} as Record<string, DosePhrase[]>);

  const handleCreatePhrase = () => {
    const newPhrase: DosePhrase = {
      id: `phrase_${Date.now()}`,
      text: '',
      textAr: '',
      category: 'morning',
      type: 'headline',
      tone: 'informative',
      isActive: true,
      usage_count: 0,
      createdAt: new Date()
    };
    setEditingPhrase(newPhrase);
    setIsEditDialogOpen(true);
  };

  const handleEditPhrase = (phrase: DosePhrase) => {
    setEditingPhrase({ ...phrase });
    setIsEditDialogOpen(true);
  };

  const handleSavePhrase = () => {
    if (!editingPhrase) return;

    if (!editingPhrase.textAr.trim()) {
      toast.error(isArabic ? 'النص العربي مطلوب' : 'Arabic text is required');
      return;
    }

    const isNew = !phrases.find(p => p.id === editingPhrase.id);
    
    if (isNew) {
      onPhrasesUpdate([...phrases, editingPhrase]);
      toast.success(isArabic ? 'تم إضافة العبارة' : 'Phrase added successfully');
    } else {
      onPhrasesUpdate(phrases.map(p => p.id === editingPhrase.id ? editingPhrase : p));
      toast.success(isArabic ? 'تم تحديث العبارة' : 'Phrase updated successfully');
    }

    setIsEditDialogOpen(false);
    setEditingPhrase(null);
  };

  const handleDeletePhrase = (phraseId: string) => {
    onPhrasesUpdate(phrases.filter(p => p.id !== phraseId));
    toast.success(isArabic ? 'تم حذف العبارة' : 'Phrase deleted successfully');
  };

  const handleToggleActive = (phraseId: string, isActive: boolean) => {
    onPhrasesUpdate(phrases.map(p => 
      p.id === phraseId ? { ...p, isActive } : p
    ));
  };

  const handleDuplicatePhrase = (phrase: DosePhrase) => {
    const duplicatedPhrase: DosePhrase = {
      ...phrase,
      id: `phrase_${Date.now()}`,
      text: `${phrase.text} (Copy)`,
      textAr: `${phrase.textAr} (نسخة)`,
      usage_count: 0,
      createdAt: new Date()
    };
    onPhrasesUpdate([...phrases, duplicatedPhrase]);
    toast.success(isArabic ? 'تم نسخ العبارة' : 'Phrase duplicated successfully');
  };

  const exportPhrases = () => {
    const dataStr = JSON.stringify(phrases, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'dose-phrases.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success(isArabic ? 'تم تصدير العبارات' : 'Phrases exported successfully');
  };

  const renderPhraseCard = (phrase: DosePhrase) => {
    const info = timeSlotInfo[phrase.category];
    const IconComponent = info.icon;

    return (
      <Card key={phrase.id} className={cn("relative", !phrase.isActive && "opacity-60")}>
        <CardHeader className="pb-3">
          <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
            <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
              <SafeIcon icon={IconComponent} className={cn("h-4 w-4", info.color)} />
              <span className="text-sm">{info.emoji}</span>
              <Badge variant="outline" className="text-xs font-arabic">
                {phrase.type === 'headline' 
                  ? (isArabic ? 'عنوان رئيسي' : 'Headline')
                  : (isArabic ? 'عنوان فرعي' : 'Subheadline')
                }
              </Badge>
              <Badge variant="secondary" className="text-xs font-arabic">
                {phrase.tone === 'energetic' 
                  ? (isArabic ? 'نشيط' : 'Energetic')
                  : phrase.tone === 'informative'
                  ? (isArabic ? 'إعلامي' : 'Informative')
                  : phrase.tone === 'calm'
                  ? (isArabic ? 'هادئ' : 'Calm')
                  : (isArabic ? 'تحليلي' : 'Analytical')
                }
              </Badge>
            </div>
            <div className={cn("flex items-center gap-1", isRTL && "flex-row-reverse")}>
              <Switch 
                checked={phrase.isActive}
                onCheckedChange={(checked) => handleToggleActive(phrase.id, checked)}
                size="sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={cn("space-y-1", isRTL && "text-right")}>
            <p className="font-medium text-sm font-arabic">
              {phrase.textAr}
            </p>
            {phrase.text && (
              <p className="text-xs text-muted-foreground">
                {phrase.text}
              </p>
            )}
          </div>

          <div className={cn("flex items-center justify-between text-xs text-muted-foreground", isRTL && "flex-row-reverse")}>
            <span className="font-arabic">
              {isArabic ? 'مرات الاستخدام:' : 'Used:'} {phrase.usage_count}
            </span>
            <span className="font-arabic">
              {safeDateFormat(phrase.createdAt, isArabic ? 'ar-SA' : 'en-US')}
            </span>
          </div>

          <div className={cn("flex gap-1", isRTL && "flex-row-reverse")}>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEditPhrase(phrase)}
              className="font-arabic text-xs"
            >
              <SafeIcon icon={Edit} className="h-3 w-3" />
              {isArabic ? 'تحرير' : 'Edit'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDuplicatePhrase(phrase)}
              className="font-arabic text-xs"
            >
              <SafeIcon icon={Copy} className="h-3 w-3" />
              {isArabic ? 'نسخ' : 'Copy'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleDeletePhrase(phrase.id)}
              className="font-arabic text-xs text-destructive hover:text-destructive"
            >
              <SafeIcon icon={Trash2} className="h-3 w-3" />
              {isArabic ? 'حذف' : 'Delete'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
        <div className={cn("space-y-1", isRTL && "text-right")}>
          <h2 className="text-2xl font-bold tracking-tight font-arabic">
            {isArabic ? 'مكتبة العبارات التحريرية' : 'Editorial Phrase Library'}
          </h2>
          <p className="text-muted-foreground font-arabic">
            {isArabic ? 'إدارة العبارات الجاهزة للجرعات الذكية' : 'Manage ready-made phrases for smart doses'}
          </p>
        </div>
        <div className={cn("flex gap-2", isRTL && "flex-row-reverse")}>
          <Button onClick={exportPhrases} variant="outline" className="font-arabic">
            <SafeIcon icon={Download} className="h-4 w-4" />
            {isArabic ? 'تصدير' : 'Export'}
          </Button>
          <Button onClick={handleCreatePhrase} className="font-arabic">
            <SafeIcon icon={Plus} className="h-4 w-4" />
            {isArabic ? 'إضافة عبارة' : 'Add Phrase'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="font-arabic">{isArabic ? 'البحث' : 'Search'}</Label>
              <div className="relative">
                <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRTL ? "right-3" : "left-3")} />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isArabic ? 'ابحث في العبارات...' : 'Search phrases...'}
                  className={cn("font-arabic", isRTL ? "pr-10" : "pl-10")}
                  dir={isArabic ? 'rtl' : 'ltr'}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-arabic">{isArabic ? 'الفترة الزمنية' : 'Time Slot'}</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="font-arabic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-arabic">
                    {isArabic ? 'جميع الفترات' : 'All Time Slots'}
                  </SelectItem>
                  {Object.entries(timeSlotInfo).map(([key, info]) => (
                    <SelectItem key={key} value={key} className="font-arabic">
                      {info.emoji} {info.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-arabic">{isArabic ? 'نوع العبارة' : 'Phrase Type'}</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="font-arabic">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="font-arabic">
                    {isArabic ? 'جميع الأنواع' : 'All Types'}
                  </SelectItem>
                  <SelectItem value="headline" className="font-arabic">
                    {isArabic ? 'عنوان رئيسي' : 'Headline'}
                  </SelectItem>
                  <SelectItem value="subheadline" className="font-arabic">
                    {isArabic ? 'عنوان فرعي' : 'Subheadline'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="font-arabic">{isArabic ? 'الإحصائيات' : 'Stats'}</Label>
              <div className={cn("flex items-center gap-2 text-sm", isRTL && "flex-row-reverse")}>
                <Badge variant="outline" className="font-arabic">
                  {phrases.length} {isArabic ? 'عبارة' : 'phrases'}
                </Badge>
                <Badge variant="outline" className="font-arabic">
                  {phrases.filter(p => p.isActive).length} {isArabic ? 'نشطة' : 'active'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phrases Grid */}
      <ScrollArea className="h-[600px]">
        <div className="space-y-6">
          {Object.keys(timeSlotInfo).map(category => {
            const categoryPhrases = Object.entries(groupedPhrases)
              .filter(([key]) => key.startsWith(category))
              .reduce((acc, [key, phrases]) => ({ ...acc, [key]: phrases }), {});

            if (Object.keys(categoryPhrases).length === 0) return null;

            const info = timeSlotInfo[category as keyof typeof timeSlotInfo];
            const IconComponent = info.icon;

            return (
              <div key={category} className="space-y-4">
                <div className={cn("flex items-center gap-3", isRTL && "flex-row-reverse")}>
                  <SafeIcon icon={IconComponent} className={cn("h-6 w-6", info.color)} />
                  <span className="text-xl">{info.emoji}</span>
                  <h3 className="text-lg font-semibold font-arabic">{info.label}</h3>
                  <Badge variant="secondary" className="font-arabic">
                    {Object.values(categoryPhrases).flat().length} {isArabic ? 'عبارة' : 'phrases'}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {['headline', 'subheadline'].map(type => {
                    const key = `${category}-${type}`;
                    const typePhrases = categoryPhrases[key] || [];
                    
                    if (typePhrases.length === 0) return null;

                    return (
                      <div key={type} className="space-y-3">
                        <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                          <h4 className="font-medium font-arabic">
                            {type === 'headline' 
                              ? (isArabic ? 'العناوين الرئيسية' : 'Headlines')
                              : (isArabic ? 'العناوين الفرعية' : 'Subheadlines')
                            }
                          </h4>
                          <Badge variant="outline" className="text-xs font-arabic">
                            {typePhrases.length}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {typePhrases.map(renderPhraseCard)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Separator />
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Edit Dialog */}
      {isEditDialogOpen && editingPhrase && (
        <Dialog open onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className={cn("font-arabic", isRTL && "text-right")}>
                {phrases.find(p => p.id === editingPhrase.id) 
                  ? (isArabic ? 'تحرير العبارة' : 'Edit Phrase')
                  : (isArabic ? 'إضافة عبارة جديدة' : 'Add New Phrase')
                }
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-arabic">{isArabic ? 'الفترة الزمنية' : 'Time Slot'}</Label>
                  <Select 
                    value={editingPhrase.category} 
                    onValueChange={(value: any) => setEditingPhrase(prev => prev ? { ...prev, category: value } : null)}
                  >
                    <SelectTrigger className="font-arabic">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(timeSlotInfo).map(([key, info]) => (
                        <SelectItem key={key} value={key} className="font-arabic">
                          {info.emoji} {info.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="font-arabic">{isArabic ? 'نوع العبارة' : 'Phrase Type'}</Label>
                  <Select 
                    value={editingPhrase.type} 
                    onValueChange={(value: any) => setEditingPhrase(prev => prev ? { ...prev, type: value } : null)}
                  >
                    <SelectTrigger className="font-arabic">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="headline" className="font-arabic">
                        {isArabic ? 'عنوان رئيسي' : 'Headline'}
                      </SelectItem>
                      <SelectItem value="subheadline" className="font-arabic">
                        {isArabic ? 'عنوان فرعي' : 'Subheadline'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">{isArabic ? 'النبرة' : 'Tone'}</Label>
                <Select 
                  value={editingPhrase.tone} 
                  onValueChange={(value: any) => setEditingPhrase(prev => prev ? { ...prev, tone: value } : null)}
                >
                  <SelectTrigger className="font-arabic">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="energetic" className="font-arabic">
                      {isArabic ? 'نشيط' : 'Energetic'}
                    </SelectItem>
                    <SelectItem value="informative" className="font-arabic">
                      {isArabic ? 'إعلامي' : 'Informative'}
                    </SelectItem>
                    <SelectItem value="calm" className="font-arabic">
                      {isArabic ? 'هادئ' : 'Calm'}
                    </SelectItem>
                    <SelectItem value="analytical" className="font-arabic">
                      {isArabic ? 'تحليلي' : 'Analytical'}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">{isArabic ? 'النص العربي' : 'Arabic Text'} *</Label>
                <Textarea
                  value={editingPhrase.textAr}
                  onChange={(e) => setEditingPhrase(prev => prev ? { ...prev, textAr: e.target.value } : null)}
                  placeholder={isArabic ? 'أدخل النص العربي...' : 'Enter Arabic text...'}
                  className="font-arabic"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-arabic">{isArabic ? 'النص الإنجليزي (اختياري)' : 'English Text (Optional)'}</Label>
                <Textarea
                  value={editingPhrase.text}
                  onChange={(e) => setEditingPhrase(prev => prev ? { ...prev, text: e.target.value } : null)}
                  placeholder={isArabic ? 'أدخل النص الإنجليزي...' : 'Enter English text...'}
                  className="font-arabic"
                  dir="ltr"
                />
              </div>

              <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                  <Switch 
                    checked={editingPhrase.isActive}
                    onCheckedChange={(checked) => setEditingPhrase(prev => prev ? { ...prev, isActive: checked } : null)}
                  />
                  <Label className="font-arabic">
                    {isArabic ? 'نشط' : 'Active'}
                  </Label>
                </div>
              </div>
            </div>

            <DialogFooter className={cn("gap-2", isRTL && "flex-row-reverse")}>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="font-arabic">
                <SafeIcon icon={X} className="h-4 w-4" />
                {isArabic ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleSavePhrase} className="font-arabic">
                <SafeIcon icon={Save} className="h-4 w-4" />
                {isArabic ? 'حفظ' : 'Save'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}