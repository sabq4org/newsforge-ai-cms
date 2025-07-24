import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Video, 
  FileAudio, 
  File, 
  Check, 
  AlertCircle,
  Eye,
  Download,
  Copy,
  Trash2,
  Settings,
  Folder,
  Tag,
  Optimize,
  Zap
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { MediaFile, MediaFolder } from '@/types';
import { mediaService } from '@/lib/mediaService';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { useKV } from '@github/spark/hooks';
import { cn } from '@/lib/utils';

interface MediaUploadProps {
  onMediaSelect?: (media: MediaFile) => void;
  multiple?: boolean;
  acceptedTypes?: string[];
  maxFileSize?: number;
  folder?: string;
  className?: string;
}

export function MediaUpload({
  onMediaSelect,
  multiple = false,
  acceptedTypes = ['image/*', 'video/*', 'audio/*', 'application/pdf'],
  maxFileSize = 50 * 1024 * 1024, // 50MB
  folder,
  className
}: MediaUploadProps) {
  const { language } = useAuth();
  const typography = useOptimizedTypography();
  const { isRTL, isArabic } = typography;
  
  const [mediaFiles, setMediaFiles] = useKV<MediaFile[]>('sabq-media-files', []);
  const [mediaFolders, setMediaFolders] = useKV<MediaFolder[]>('sabq-media-folders', []);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [isUploading, setIsUploading] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(folder || 'root');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [optimizeImages, setOptimizeImages] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<MediaFile[]>([]);
  const [showUploadForm, setShowUploadForm] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Filter media files based on current folder, type, and search
  const filteredMedia = mediaFiles.filter(file => {
    const matchesFolder = !file.folder || file.folder === currentFolder;
    const matchesType = filterType === 'all' || 
      (filterType === 'image' && file.mimeType.startsWith('image/')) ||
      (filterType === 'video' && file.mimeType.startsWith('video/')) ||
      (filterType === 'audio' && file.mimeType.startsWith('audio/')) ||
      (filterType === 'document' && !file.mimeType.startsWith('image/') && !file.mimeType.startsWith('video/') && !file.mimeType.startsWith('audio/'));
    
    const matchesSearch = !searchQuery || 
      file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.alt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.caption?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesFolder && matchesType && matchesSearch;
  });

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setSelectedFiles(Array.from(files));
      setShowUploadForm(true);
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files) {
      setSelectedFiles(Array.from(files));
      setShowUploadForm(true);
    }
  }, []);

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
  }, []);

  const uploadFiles = async (uploadData: {
    alt?: string;
    altAr?: string;
    caption?: string;
    captionAr?: string;
    tags?: string[];
    folder?: string;
  }) => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    const newProgress: { [key: string]: number } = {};
    
    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const fileKey = `${file.name}-${i}`;
        
        newProgress[fileKey] = 0;
        setUploadProgress({ ...newProgress });
        
        try {
          const mediaFile = await mediaService.uploadFile(file, {
            ...uploadData,
            folder: uploadData.folder || currentFolder,
            autoOptimize: optimizeImages && file.type.startsWith('image/')
          });
          
          newProgress[fileKey] = 100;
          setUploadProgress({ ...newProgress });
          
          setMediaFiles(current => [...current, mediaFile]);
          
          if (onMediaSelect) {
            onMediaSelect(mediaFile);
          }
          
          toast.success(
            isArabic 
              ? `تم رفع ${file.name} بنجاح`
              : `${file.name} uploaded successfully`
          );
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          toast.error(
            isArabic 
              ? `فشل رفع ${file.name}`
              : `Failed to upload ${file.name}`
          );
        }
      }
    } finally {
      setIsUploading(false);
      setSelectedFiles([]);
      setUploadProgress({});
      setShowUploadForm(false);
    }
  };

  const handleMediaSelect = (media: MediaFile) => {
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
      if (onMediaSelect) {
        onMediaSelect(media);
      }
    }
  };

  const copyMediaUrl = (media: MediaFile) => {
    navigator.clipboard.writeText(media.url);
    toast.success(isArabic ? 'تم نسخ الرابط' : 'URL copied to clipboard');
  };

  const deleteMedia = (media: MediaFile) => {
    setMediaFiles(current => current.filter(m => m.id !== media.id));
    toast.success(isArabic ? 'تم حذف الملف' : 'File deleted');
  };

  const formatFileSize = (bytes: number) => {
    return mediaService.formatFileSize(bytes);
  };

  const renderMediaItem = (media: MediaFile) => {
    const isSelected = selectedMedia.find(m => m.id === media.id);
    const isImage = media.mimeType.startsWith('image/');
    
    return (
      <Card 
        key={media.id}
        className={cn(
          "group cursor-pointer transition-all duration-200 hover:shadow-md",
          isSelected && "ring-2 ring-primary",
          viewMode === 'grid' ? "aspect-square" : "h-24"
        )}
        onClick={() => handleMediaSelect(media)}
      >
        <CardContent className={cn(
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
            
            {/* Quick actions overlay */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  copyMediaUrl(media);
                }}
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 w-8 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(media.url, '_blank');
                }}
              >
                <Eye className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 w-8 p-1"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteMedia(media);
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
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
              {formatFileSize(media.size)}
            </p>
            {media.metadata.width && media.metadata.height && (
              <p className="text-xs text-muted-foreground">
                {media.metadata.width} × {media.metadata.height}
              </p>
            )}
            {media.optimizations.length > 0 && (
              <Badge variant="secondary" className="text-xs mt-1">
                <Zap className="w-3 h-3 mr-1" />
                {isArabic ? 'محسّن' : 'Optimized'}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {isArabic ? 'مكتبة الوسائط' : 'Media Library'}
          </h2>
          <p className="text-muted-foreground">
            {isArabic 
              ? 'إدارة ملفات الصور والفيديو والمستندات'
              : 'Manage images, videos, and documents'
            }
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
          >
            {viewMode === 'grid' ? '☰' : '⊞'}
          </Button>
          
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-4 h-4 mr-2" />
            {isArabic ? 'رفع ملفات' : 'Upload Files'}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isArabic ? 'جميع الملفات' : 'All Files'}</SelectItem>
            <SelectItem value="image">{isArabic ? 'الصور' : 'Images'}</SelectItem>
            <SelectItem value="video">{isArabic ? 'الفيديو' : 'Videos'}</SelectItem>
            <SelectItem value="audio">{isArabic ? 'الصوت' : 'Audio'}</SelectItem>
            <SelectItem value="document">{isArabic ? 'المستندات' : 'Documents'}</SelectItem>
          </SelectContent>
        </Select>
        
        <Input
          placeholder={isArabic ? 'البحث...' : 'Search...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-64"
        />
        
        <Badge variant="outline">
          {filteredMedia.length} {isArabic ? 'ملف' : 'files'}
        </Badge>
      </div>

      {/* Drop Zone */}
      <div
        ref={dropZoneRef}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors"
      >
        <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-lg font-medium mb-2">
          {isArabic ? 'اسحب وأفلت الملفات هنا' : 'Drag and drop files here'}
        </p>
        <p className="text-muted-foreground mb-4">
          {isArabic ? 'أو انقر لاختيار الملفات' : 'or click to select files'}
        </p>
        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
          {isArabic ? 'اختر الملفات' : 'Choose Files'}
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={acceptedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Media Grid/List */}
      <ScrollArea className="h-96">
        <div className={cn(
          "gap-4",
          viewMode === 'grid' 
            ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6" 
            : "flex flex-col space-y-2"
        )}>
          {filteredMedia.map(renderMediaItem)}
        </div>
        
        {filteredMedia.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {isArabic ? 'لا توجد ملفات مطابقة' : 'No matching files found'}
          </div>
        )}
      </ScrollArea>

      {/* Upload Form Dialog */}
      <Dialog open={showUploadForm} onOpenChange={setShowUploadForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'تفاصيل الرفع' : 'Upload Details'}
            </DialogTitle>
            <DialogDescription>
              {isArabic 
                ? `رفع ${selectedFiles.length} ملف(ات)`
                : `Uploading ${selectedFiles.length} file(s)`
              }
            </DialogDescription>
          </DialogHeader>
          
          <UploadForm
            files={selectedFiles}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            optimizeImages={optimizeImages}
            onOptimizeChange={setOptimizeImages}
            onUpload={uploadFiles}
            onCancel={() => {
              setShowUploadForm(false);
              setSelectedFiles([]);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Selected Media Actions */}
      {multiple && selectedMedia.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedMedia.length} {isArabic ? 'ملف محدد' : 'files selected'}
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    selectedMedia.forEach(media => {
                      if (onMediaSelect) onMediaSelect(media);
                    });
                    setSelectedMedia([]);
                  }}
                >
                  {isArabic ? 'استخدام المحدد' : 'Use Selected'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedMedia([])}
                >
                  {isArabic ? 'إلغاء التحديد' : 'Clear Selection'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Upload Form Component
interface UploadFormProps {
  files: File[];
  isUploading: boolean;
  uploadProgress: { [key: string]: number };
  optimizeImages: boolean;
  onOptimizeChange: (optimize: boolean) => void;
  onUpload: (data: {
    alt?: string;
    altAr?: string;
    caption?: string;
    captionAr?: string;
    tags?: string[];
    folder?: string;
  }) => void;
  onCancel: () => void;
}

function UploadForm({
  files,
  isUploading,
  uploadProgress,
  optimizeImages,
  onOptimizeChange,
  onUpload,
  onCancel
}: UploadFormProps) {
  const { language } = useAuth();
  const typography = useOptimizedTypography();
  const { isArabic } = typography;
  
  const [alt, setAlt] = useState('');
  const [altAr, setAltAr] = useState('');
  const [caption, setCaption] = useState('');
  const [captionAr, setCaptionAr] = useState('');
  const [tags, setTags] = useState('');
  const [folder, setFolder] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onUpload({
      alt: alt.trim() || undefined,
      altAr: altAr.trim() || undefined,
      caption: caption.trim() || undefined,
      captionAr: captionAr.trim() || undefined,
      tags: tags.trim() ? tags.split(',').map(t => t.trim()) : undefined,
      folder: folder.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* File List */}
      <div className="space-y-2">
        <Label>{isArabic ? 'الملفات المحددة:' : 'Selected Files:'}</Label>
        <div className="border rounded p-3 space-y-1 max-h-32 overflow-y-auto">
          {files.map((file, index) => {
            const fileKey = `${file.name}-${index}`;
            const progress = uploadProgress[fileKey] || 0;
            
            return (
              <div key={fileKey} className="flex items-center justify-between text-sm">
                <span className="truncate flex-1 mr-2">{file.name}</span>
                <span className="text-muted-foreground text-xs">
                  {mediaService.formatFileSize(file.size)}
                </span>
                {isUploading && progress > 0 && (
                  <Progress value={progress} className="w-20 ml-2" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="alt">{isArabic ? 'النص البديل (EN)' : 'Alt Text (EN)'}</Label>
          <Input
            id="alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder={isArabic ? 'وصف الصورة بالإنجليزية' : 'Describe the image in English'}
          />
        </div>
        <div>
          <Label htmlFor="altAr">{isArabic ? 'النص البديل (AR)' : 'Alt Text (AR)'}</Label>
          <Input
            id="altAr"
            value={altAr}
            onChange={(e) => setAltAr(e.target.value)}
            placeholder={isArabic ? 'وصف الصورة بالعربية' : 'Describe the image in Arabic'}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="caption">{isArabic ? 'التعليق (EN)' : 'Caption (EN)'}</Label>
          <Textarea
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={isArabic ? 'تعليق اختياري بالإنجليزية' : 'Optional caption in English'}
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="captionAr">{isArabic ? 'التعليق (AR)' : 'Caption (AR)'}</Label>
          <Textarea
            id="captionAr"
            value={captionAr}
            onChange={(e) => setCaptionAr(e.target.value)}
            placeholder={isArabic ? 'تعليق اختياري بالعربية' : 'Optional caption in Arabic'}
            rows={3}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="tags">{isArabic ? 'العلامات' : 'Tags'}</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder={isArabic ? 'علامات مفصولة بفواصل' : 'Comma-separated tags'}
        />
      </div>

      <div>
        <Label htmlFor="folder">{isArabic ? 'المجلد' : 'Folder'}</Label>
        <Input
          id="folder"
          value={folder}
          onChange={(e) => setFolder(e.target.value)}
          placeholder={isArabic ? 'اسم المجلد (اختياري)' : 'Folder name (optional)'}
        />
      </div>

      {/* Image Optimization */}
      {files.some(f => f.type.startsWith('image/')) && (
        <div className="flex items-center space-x-2">
          <Checkbox
            id="optimize"
            checked={optimizeImages}
            onCheckedChange={(checked) => onOptimizeChange(checked as boolean)}
          />
          <Label htmlFor="optimize" className="text-sm">
            {isArabic ? 'تحسين الصور تلقائياً' : 'Automatically optimize images'}
          </Label>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isUploading}
        >
          {isArabic ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button type="submit" disabled={isUploading}>
          {isUploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {isArabic ? 'جاري الرفع...' : 'Uploading...'}
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {isArabic ? 'رفع الملفات' : 'Upload Files'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}