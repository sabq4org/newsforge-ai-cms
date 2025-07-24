import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Image as ImageIcon, 
  Video, 
  FileAudio, 
  File, 
  Check, 
  Upload,
  Search,
  Grid3X3,
  List
} from '@phosphor-icons/react';
import { MediaFile } from '@/types';
import { mediaService } from '@/lib/mediaService';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { useKV } from '@github/spark/hooks';
import { cn } from '@/lib/utils';
import { MediaUpload } from './MediaUpload';

interface MediaPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: MediaFile | MediaFile[]) => void;
  multiple?: boolean;
  allowedTypes?: ('image' | 'video' | 'audio' | 'document')[];
  title?: string;
  description?: string;
}

export function MediaPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  allowedTypes = ['image', 'video', 'audio', 'document'],
  title,
  description
}: MediaPickerProps) {
  const { language } = useAuth();
  const typography = useOptimizedTypography();
  const { isRTL, isArabic } = typography;
  
  const [mediaFiles] = useKV<MediaFile[]>('sabq-media-files', []);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'browse' | 'upload'>('browse');

  // Filter media files
  const filteredMedia = mediaFiles.filter(file => {
    // Type filter
    const matchesType = filterType === 'all' || 
      (filterType === 'image' && file.mimeType.startsWith('image/')) ||
      (filterType === 'video' && file.mimeType.startsWith('video/')) ||
      (filterType === 'audio' && file.mimeType.startsWith('audio/')) ||
      (filterType === 'document' && !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/') && !file.mimeType.startsWith('audio/'));
    
    // Allowed types filter
    const isAllowedType = allowedTypes.some(type => {
      if (type === 'image') return file.mimeType.startsWith('image/');
      if (type === 'video') return file.mimeType.startsWith('video/');
      if (type === 'audio') return file.mimeType.startsWith('audio/');
      if (type === 'document') return !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/') && !file.mimeType.startsWith('audio/');
      return false;
    });
    
    // Search filter
    const matchesSearch = !searchQuery || 
      file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.alt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.caption?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesType && isAllowedType && matchesSearch;
  });

  // Reset selection when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedMedia([]);
      setSearchQuery('');
      setActiveTab('browse');
    }
  }, [open]);

  const handleMediaClick = (media: MediaFile) => {
    if (multiple) {
      setSelectedMedia(current => {
        const isSelected = current.find(m => m.id === media.id);
        if (isSelected) {
          return current.filter(m => m.id !== media.id);
        } else {
          return [...current, media];
        }
      });
    } else {
      setSelectedMedia([media]);
    }
  };

  const handleSelect = () => {
    if (selectedMedia.length > 0) {
      onSelect(multiple ? selectedMedia : selectedMedia[0]);
      onOpenChange(false);
    }
  };

  const handleUpload = (media: MediaFile) => {
    if (multiple) {
      setSelectedMedia(current => [...current, media]);
    } else {
      onSelect(media);
      onOpenChange(false);
    }
  };

  const renderMediaItem = (media: MediaFile) => {
    const isSelected = selectedMedia.find(m => m.id === media.id);
    const isImage = media.mimeType.startsWith('image/');
    
    return (
      <div
        key={media.id}
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:shadow-md rounded-lg border-2",
          isSelected ? "border-primary bg-primary/5" : "border-transparent hover:border-muted-foreground/25",
          viewMode === 'grid' ? "aspect-square" : "h-20"
        )}
        onClick={() => handleMediaClick(media)}
      >
        <div className={cn(
          "p-2 h-full flex",
          viewMode === 'grid' ? "flex-col" : "flex-row items-center gap-3"
        )}>
          {/* Thumbnail/Preview */}
          <div className={cn(
            "relative overflow-hidden rounded bg-muted flex items-center justify-center",
            viewMode === 'grid' ? "flex-1 mb-2" : "w-16 h-16 flex-shrink-0"
          )}>
            {isImage ? (
              <img
                src={media.thumbnailUrl || media.url}
                alt={media.alt || media.originalName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-2xl">
                {media.mimeType.startsWith('video/') ? (
                  <Video className="w-8 h-8 text-muted-foreground" />
                ) : media.mimeType.startsWith('audio/') ? (
                  <FileAudio className="w-8 h-8 text-muted-foreground" />
                ) : (
                  <File className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
            )}
            
            {/* Selection indicator */}
            {isSelected && (
              <div className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                <Check className="w-3 h-3" />
              </div>
            )}
            
            {/* File type badge */}
            <div className="absolute top-1 left-1">
              <Badge variant="secondary" className="text-xs">
                {media.mimeType.split('/')[1].toUpperCase()}
              </Badge>
            </div>
          </div>
          
          {/* File info */}
          <div className={cn(
            "min-w-0",
            viewMode === 'grid' ? "text-center" : "flex-1"
          )}>
            <p className="text-sm font-medium truncate" title={media.originalName}>
              {media.originalName}
            </p>
            <p className="text-xs text-muted-foreground">
              {mediaService.formatFileSize(media.size)}
            </p>
            {media.metadata.width && media.metadata.height && (
              <p className="text-xs text-muted-foreground">
                {media.metadata.width} × {media.metadata.height}
              </p>
            )}
            {media.alt && (
              <p className="text-xs text-muted-foreground truncate">
                {media.alt}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {title || (isArabic ? 'اختيار الوسائط' : 'Select Media')}
          </DialogTitle>
          <DialogDescription>
            {description || (
              isArabic 
                ? `اختر ${multiple ? 'ملف أو أكثر' : 'ملف واحد'} من مكتبة الوسائط`
                : `Choose ${multiple ? 'one or more files' : 'a file'} from your media library`
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="browse">
              <Search className="w-4 h-4 mr-2" />
              {isArabic ? 'تصفح المكتبة' : 'Browse Library'}
            </TabsTrigger>
            <TabsTrigger value="upload">
              <Upload className="w-4 h-4 mr-2" />
              {isArabic ? 'رفع جديد' : 'Upload New'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="flex-1 flex flex-col space-y-4">
            {/* Browse Controls */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{isArabic ? 'الكل' : 'All'}</SelectItem>
                    {allowedTypes.includes('image') && (
                      <SelectItem value="image">{isArabic ? 'الصور' : 'Images'}</SelectItem>
                    )}
                    {allowedTypes.includes('video') && (
                      <SelectItem value="video">{isArabic ? 'الفيديو' : 'Videos'}</SelectItem>
                    )}
                    {allowedTypes.includes('audio') && (
                      <SelectItem value="audio">{isArabic ? 'الصوت' : 'Audio'}</SelectItem>
                    )}
                    {allowedTypes.includes('document') && (
                      <SelectItem value="document">{isArabic ? 'المستندات' : 'Documents'}</SelectItem>
                    )}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
                </Button>
              </div>

              <Input
                placeholder={isArabic ? 'البحث في الملفات...' : 'Search files...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 max-w-xs"
              />

              <Badge variant="outline">
                {filteredMedia.length} {isArabic ? 'ملف' : 'files'}
              </Badge>
            </div>

            {/* Media Grid */}
            <ScrollArea className="flex-1">
              <div className={cn(
                "gap-3 p-1",
                viewMode === 'grid' 
                  ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6" 
                  : "flex flex-col space-y-2"
              )}>
                {filteredMedia.map(renderMediaItem)}
              </div>
              
              {filteredMedia.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="mb-4">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  </div>
                  <p className="text-lg font-medium mb-2">
                    {isArabic ? 'لا توجد ملفات' : 'No files found'}
                  </p>
                  <p className="text-sm">
                    {isArabic 
                      ? 'لم يتم العثور على ملفات مطابقة للبحث'
                      : 'No files match your search criteria'
                    }
                  </p>
                </div>
              )}
            </ScrollArea>

            {/* Selection Summary */}
            {selectedMedia.length > 0 && (
              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedMedia.length} {isArabic ? 'ملف محدد' : 'file(s) selected'}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMedia([])}
                    >
                      {isArabic ? 'إلغاء التحديد' : 'Clear'}
                    </Button>
                    <Button size="sm" onClick={handleSelect}>
                      {isArabic ? 'اختيار' : 'Select'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="flex-1">
            <MediaUpload
              onMediaSelect={handleUpload}
              multiple={false}
              acceptedTypes={allowedTypes.map(type => {
                if (type === 'image') return 'image/*';
                if (type === 'video') return 'video/*';
                if (type === 'audio') return 'audio/*';
                if (type === 'document') return 'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                return '*/*';
              })}
              className="h-full"
            />
          </TabsContent>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isArabic ? 'إلغاء' : 'Cancel'}
          </Button>
          {activeTab === 'browse' && selectedMedia.length === 0 && (
            <Button disabled>
              {isArabic ? 'اختيار' : 'Select'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}