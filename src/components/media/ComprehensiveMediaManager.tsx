import { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { useKV } from '@github/spark/hooks';
import { MediaFile, ImageOptimization, BulkOperation } from '@/types';
import { cn } from '@/lib/utils';
import {
  Upload,
  Image as ImageIcon,
  Video,
  FileAudio,
  File,
  Download,
  Trash,
  Edit,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Share,
  Copy,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Settings,
  FolderOpen,
  Tag as TagIcon,
  Calendar,
  User,
  FileX,
  AlertTriangle,
  Sparkle,
  ArrowsClockwise,
  MagicWand
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface ComprehensiveMediaManagerProps {
  onImageSelect?: (url: string) => void;
  selectionMode?: boolean;
}

export function ComprehensiveMediaManager({ onImageSelect, selectionMode = false }: ComprehensiveMediaManagerProps) {
  const { language, user } = useAuth();
  const typography = useOptimizedTypography();
  const isArabic = language.code === 'ar';

  // State management
  const [mediaFiles, setMediaFiles] = useKV<MediaFile[]>('sabq-media-files', []);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [showOptimization, setShowOptimization] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<BulkOperation | null>(null);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // File filtering and sorting
  const filteredFiles = mediaFiles
    .filter(file => {
      // Search filter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = file.filename.toLowerCase().includes(searchLower) ||
                           file.alt?.toLowerCase().includes(searchLower) ||
                           file.caption?.toLowerCase().includes(searchLower) ||
                           file.tags.some(tag => tag.toLowerCase().includes(searchLower));

      // Type filter
      const matchesType = filterType === 'all' || file.mimeType.startsWith(filterType === 'document' ? 'application' : filterType);

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.filename.localeCompare(b.filename);
        case 'size':
          return b.size - a.size;
        case 'date':
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });

  // File upload handler
  const handleFileUpload = useCallback(async (files: FileList) => {
    if (!files.length) return;

    setIsUploading(true);
    setUploadProgress(0);

    const newFiles: MediaFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast.error(`${file.name}: ${isArabic ? 'الملف كبير جداً (50MB كحد أقصى)' : 'File too large (50MB max)'}`);
        continue;
      }

      try {
        // Update progress
        setUploadProgress((i / files.length) * 90);

        // Create file URL (in real implementation, upload to cloud storage)
        const url = URL.createObjectURL(file);
        const thumbnailUrl = file.type.startsWith('image/') ? url : undefined;

        // Extract metadata
        const metadata = await extractFileMetadata(file);

        const newFile: MediaFile = {
          id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          filename: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
          url,
          thumbnailUrl,
          uploadedBy: user?.id || 'unknown',
          uploadedAt: new Date(),
          metadata,
          optimizations: [],
          tags: [],
          usage: []
        };

        newFiles.push(newFile);

        // Auto-optimize images
        if (file.type.startsWith('image/') && file.size > 1024 * 1024) { // 1MB threshold
          await optimizeImage(newFile);
        }

      } catch (error) {
        toast.error(`${file.name}: ${isArabic ? 'خطأ في الرفع' : 'Upload error'}`);
      }
    }

    setMediaFiles(current => [...newFiles, ...current]);
    setUploadProgress(100);
    
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
    }, 500);

    toast.success(isArabic ? 
      `تم رفع ${newFiles.length} ملف بنجاح` : 
      `Successfully uploaded ${newFiles.length} file(s)`
    );
  }, [user, isArabic, setMediaFiles]);

  // Extract file metadata
  const extractFileMetadata = async (file: File) => {
    const metadata: any = {
      format: file.type,
      isOptimized: false,
      originalSize: file.size
    };

    if (file.type.startsWith('image/')) {
      try {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = url;
        });

        metadata.width = img.width;
        metadata.height = img.height;
        
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error extracting image metadata:', error);
      }
    }

    return metadata;
  };

  // Image optimization
  const optimizeImage = async (file: MediaFile) => {
    if (!file.mimeType.startsWith('image/')) return;

    const optimization: ImageOptimization = {
      id: `opt_${Date.now()}`,
      type: 'compress',
      status: 'processing',
      originalUrl: file.url,
      optimizedUrl: file.url, // In real implementation, would be different
      settings: {
        quality: 85,
        format: 'webp',
        progressive: true
      },
      sizeBefore: file.size,
      sizeAfter: Math.round(file.size * 0.7), // Mock 30% reduction
      compressionRatio: 0.7,
      createdAt: new Date()
    };

    // Update file with optimization
    setMediaFiles(current => current.map(f => 
      f.id === file.id ? {
        ...f,
        optimizations: [...f.optimizations, optimization],
        metadata: {
          ...f.metadata,
          isOptimized: true,
          compressedSize: optimization.sizeAfter,
          compressionRatio: optimization.compressionRatio
        }
      } : f
    ));

    // Simulate processing time
    setTimeout(() => {
      setMediaFiles(current => current.map(f => 
        f.id === file.id ? {
          ...f,
          optimizations: f.optimizations.map(opt => 
            opt.id === optimization.id ? {
              ...opt,
              status: 'completed',
              completedAt: new Date()
            } : opt
          )
        } : f
      ));
      
      toast.success(isArabic ? 
        `تم تحسين ${file.filename}` : 
        `Optimized ${file.filename}`
      );
    }, 2000);
  };

  // Bulk operations
  const performBulkOperation = async (operation: 'delete' | 'optimize' | 'tag') => {
    if (!selectedFiles.length) {
      toast.error(isArabic ? 'يرجى اختيار ملفات أولاً' : 'Please select files first');
      return;
    }

    const bulkOp: BulkOperation = {
      id: `bulk_${Date.now()}`,
      type: operation,
      mediaIds: selectedFiles,
      status: 'processing',
      progress: 0,
      results: {
        successful: 0,
        failed: 0,
        errors: []
      },
      createdBy: user?.id || 'unknown',
      createdAt: new Date()
    };

    setBulkOperation(bulkOp);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const fileId = selectedFiles[i];
        const progress = ((i + 1) / selectedFiles.length) * 100;
        
        setBulkOperation(prev => prev ? { ...prev, progress } : null);

        switch (operation) {
          case 'delete':
            setMediaFiles(current => current.filter(f => f.id !== fileId));
            break;
          case 'optimize':
            const file = mediaFiles.find(f => f.id === fileId);
            if (file && file.mimeType.startsWith('image/')) {
              await optimizeImage(file);
            }
            break;
          case 'tag':
            // Would open tag dialog in real implementation
            break;
        }

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setBulkOperation(prev => prev ? {
        ...prev,
        status: 'completed',
        completedAt: new Date(),
        results: {
          successful: selectedFiles.length,
          failed: 0,
          errors: []
        }
      } : null);

      setSelectedFiles([]);
      toast.success(isArabic ? 
        `تمت العملية على ${selectedFiles.length} ملف` : 
        `Operation completed on ${selectedFiles.length} files`
      );

    } catch (error) {
      setBulkOperation(prev => prev ? {
        ...prev,
        status: 'failed',
        results: {
          successful: 0,
          failed: selectedFiles.length,
          errors: ['Operation failed']
        }
      } : null);
      
      toast.error(isArabic ? 'فشلت العملية' : 'Operation failed');
    }

    setTimeout(() => setBulkOperation(null), 3000);
  };

  // File selection
  const toggleFileSelection = (fileId: string) => {
    if (selectionMode && onImageSelect) {
      const file = mediaFiles.find(f => f.id === fileId);
      if (file) {
        onImageSelect(file.url);
        return;
      }
    }

    setSelectedFiles(current => 
      current.includes(fileId) 
        ? current.filter(id => id !== fileId)
        : [...current, fileId]
    );
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  }, [handleFileUpload]);

  // File type icon
  const getFileTypeIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-5 h-5" />;
    if (mimeType.startsWith('video/')) return <Video className="w-5 h-5" />;
    if (mimeType.startsWith('audio/')) return <FileAudio className="w-5 h-5" />;
    return <File className="w-5 h-5" />;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <div className={cn("space-y-6", typography.rtlText)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={cn(typography.heading, "text-3xl font-bold")}>
            {isArabic ? 'مدير الوسائط' : 'Media Manager'}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isArabic ? 'رفع وإدارة وتحسين ملفات الوسائط' : 'Upload, manage and optimize media files'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedFiles.length > 0 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => performBulkOperation('optimize')}
                className="flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                {isArabic ? 'تحسين' : 'Optimize'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => performBulkOperation('delete')}
                className="flex items-center gap-2 text-red-600"
              >
                <Trash className="w-4 h-4" />
                {isArabic ? 'حذف' : 'Delete'} ({selectedFiles.length})
              </Button>
            </>
          )}
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isArabic ? 'رفع ملفات' : 'Upload Files'}
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={isArabic ? 'بحث في الملفات...' : 'Search files...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isArabic ? 'جميع الأنواع' : 'All Types'}</SelectItem>
                <SelectItem value="image">{isArabic ? 'صور' : 'Images'}</SelectItem>
                <SelectItem value="video">{isArabic ? 'فيديو' : 'Videos'}</SelectItem>
                <SelectItem value="audio">{isArabic ? 'صوت' : 'Audio'}</SelectItem>
                <SelectItem value="document">{isArabic ? 'مستندات' : 'Documents'}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">{isArabic ? 'التاريخ' : 'Date'}</SelectItem>
                <SelectItem value="name">{isArabic ? 'الاسم' : 'Name'}</SelectItem>
                <SelectItem value="size">{isArabic ? 'الحجم' : 'Size'}</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center border rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="border-0 rounded-r-none"
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="border-0 rounded-l-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            <Badge variant="outline">
              {filteredFiles.length} {isArabic ? 'ملف' : 'files'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-6">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
            className="hidden"
          />
          
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {isArabic ? 'اسحب الملفات هنا أو اضغط للاختيار' : 'Drag files here or click to select'}
            </h3>
            <p className="text-muted-foreground">
              {isArabic ? 'يدعم الصور والفيديو والصوت والمستندات' : 'Supports images, videos, audio, and documents'}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {isArabic ? 'حد أقصى 50MB لكل ملف' : 'Max 50MB per file'}
            </p>
          </div>

          {isUploading && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Upload className="w-4 h-4" />
                <span className="text-sm">{isArabic ? 'جاري الرفع...' : 'Uploading...'}</span>
                <span className="text-sm text-muted-foreground">{uploadProgress.toFixed(0)}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Bulk Operation Progress */}
      {bulkOperation && (
        <Alert>
          <Clock className="w-4 h-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>
                  {isArabic ? 'جاري تنفيذ العملية...' : 'Processing operation...'}
                </span>
                <span className="text-sm">
                  {bulkOperation.progress.toFixed(0)}%
                </span>
              </div>
              <Progress value={bulkOperation.progress} className="h-1" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Media Grid/List */}
      <div className={cn(
        "grid gap-4",
        viewMode === 'grid' 
          ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6"
          : "grid-cols-1"
      )}>
        {filteredFiles.map((file) => (
          <Card
            key={file.id}
            className={cn(
              "hover:shadow-md transition-all cursor-pointer group",
              selectedFiles.includes(file.id) && "ring-2 ring-primary",
              viewMode === 'list' && "p-0"
            )}
            onClick={() => toggleFileSelection(file.id)}
          >
            {viewMode === 'grid' ? (
              <CardContent className="p-4">
                <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden relative">
                  {file.mimeType.startsWith('image/') ? (
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={file.alt || file.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileTypeIcon(file.mimeType)}
                    </div>
                  )}
                  
                  {/* Optimization Badge */}
                  {file.metadata.isOptimized && (
                    <Badge className="absolute top-2 right-2 text-xs" variant="secondary">
                      <Sparkle className="w-3 h-3 mr-1" />
                      {isArabic ? 'محسن' : 'Optimized'}
                    </Badge>
                  )}

                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 bg-background flex items-center justify-center",
                      selectedFiles.includes(file.id) ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                    )}>
                      {selectedFiles.includes(file.id) && <CheckCircle className="w-3 h-3" />}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="font-medium text-sm truncate" title={file.filename}>
                    {file.filename}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatFileSize(file.size)}</span>
                    {file.metadata.width && file.metadata.height && (
                      <span>{file.metadata.width}×{file.metadata.height}</span>
                    )}
                  </div>
                </div>
              </CardContent>
            ) : (
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0 relative">
                    {file.mimeType.startsWith('image/') ? (
                      <img
                        src={file.thumbnailUrl || file.url}
                        alt={file.alt || file.filename}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {getFileTypeIcon(file.mimeType)}
                      </div>
                    )}
                    
                    {/* Selection Checkbox */}
                    <div className="absolute top-1 left-1">
                      <div className={cn(
                        "w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center",
                        selectedFiles.includes(file.id) ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                      )}>
                        {selectedFiles.includes(file.id) && <CheckCircle className="w-2 h-2" />}
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate" title={file.filename}>
                      {file.filename}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.metadata.width && file.metadata.height && (
                        <span>{file.metadata.width}×{file.metadata.height}</span>
                      )}
                      <span>
                        {format(new Date(file.uploadedAt), 'PPp', { 
                          locale: isArabic ? ar : enUS 
                        })}
                      </span>
                    </div>
                    {file.alt && (
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {file.alt}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {file.metadata.isOptimized && (
                      <Badge variant="secondary" className="text-xs">
                        <Sparkle className="w-3 h-3 mr-1" />
                        {isArabic ? 'محسن' : 'Optimized'}
                      </Badge>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingFile(file);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredFiles.length === 0 && !isUploading && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileX className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">
              {searchTerm || filterType !== 'all' ? 
                (isArabic ? 'لا توجد ملفات تطابق البحث' : 'No files match your search') :
                (isArabic ? 'لا توجد ملفات' : 'No files yet')
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || filterType !== 'all' ? 
                (isArabic ? 'جرب تغيير معايير البحث' : 'Try changing your search criteria') :
                (isArabic ? 'ابدأ برفع ملفاتك الأولى' : 'Start by uploading your first files')
              }
            </p>
            {!searchTerm && filterType === 'all' && (
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                {isArabic ? 'رفع ملفات' : 'Upload Files'}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit File Dialog */}
      {editingFile && (
        <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isArabic ? 'تحرير الملف' : 'Edit File'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-32 h-32 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {editingFile.mimeType.startsWith('image/') ? (
                    <img
                      src={editingFile.thumbnailUrl || editingFile.url}
                      alt={editingFile.alt || editingFile.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {getFileTypeIcon(editingFile.mimeType)}
                    </div>
                  )}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div>
                    <Label>{isArabic ? 'اسم الملف' : 'Filename'}</Label>
                    <Input value={editingFile.filename} readOnly />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>{isArabic ? 'الحجم' : 'Size'}</Label>
                      <Input value={formatFileSize(editingFile.size)} readOnly />
                    </div>
                    <div>
                      <Label>{isArabic ? 'النوع' : 'Type'}</Label>
                      <Input value={editingFile.mimeType} readOnly />
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label>{isArabic ? 'النص البديل' : 'Alt Text'}</Label>
                  <Input
                    value={editingFile.alt || ''}
                    onChange={(e) => setEditingFile(prev => prev ? { ...prev, alt: e.target.value } : null)}
                    placeholder={isArabic ? 'وصف الملف...' : 'File description...'}
                  />
                </div>

                <div>
                  <Label>{isArabic ? 'التعليق' : 'Caption'}</Label>
                  <Textarea
                    value={editingFile.caption || ''}
                    onChange={(e) => setEditingFile(prev => prev ? { ...prev, caption: e.target.value } : null)}
                    placeholder={isArabic ? 'تعليق على الملف...' : 'File caption...'}
                    rows={2}
                  />
                </div>

                <div>
                  <Label>{isArabic ? 'العلامات' : 'Tags'}</Label>
                  <Input
                    value={editingFile.tags.join(', ')}
                    onChange={(e) => setEditingFile(prev => prev ? { 
                      ...prev, 
                      tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                    } : null)}
                    placeholder={isArabic ? 'علامات مفصولة بفواصل...' : 'Comma-separated tags...'}
                  />
                </div>
              </div>

              {editingFile.optimizations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      {isArabic ? 'التحسينات' : 'Optimizations'}
                    </h4>
                    <div className="space-y-2">
                      {editingFile.optimizations.map((opt) => (
                        <div key={opt.id} className="flex items-center justify-between p-2 border rounded">
                          <div>
                            <span className="text-sm font-medium">
                              {opt.type} - {opt.settings.format}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(opt.sizeBefore)} → {formatFileSize(opt.sizeAfter)} 
                              ({((1 - opt.compressionRatio) * 100).toFixed(0)}% {isArabic ? 'توفير' : 'saved'})
                            </div>
                          </div>
                          <Badge variant={opt.status === 'completed' ? 'default' : 'secondary'}>
                            {opt.status === 'completed' ? 
                              (isArabic ? 'مكتمل' : 'Completed') : 
                              (isArabic ? 'جاري التحسين' : 'Processing')
                            }
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingFile(null)}>
                  {isArabic ? 'إلغاء' : 'Cancel'}
                </Button>
                <Button 
                  onClick={() => {
                    if (editingFile) {
                      setMediaFiles(current => current.map(f => 
                        f.id === editingFile.id ? editingFile : f
                      ));
                      setEditingFile(null);
                      toast.success(isArabic ? 'تم حفظ التغييرات' : 'Changes saved');
                    }
                  }}
                >
                  {isArabic ? 'حفظ' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}