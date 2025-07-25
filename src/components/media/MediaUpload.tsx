import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  CloudArrowUp,
  Image as ImageIcon,
  FileText,
  Video,
  Music,
  File,
  Trash,
  Eye,
  Download,
  Share,
  Settings,
  Crop,
  Palette,
  Sparkles,
  CheckCircle,
  XCircle,
  Clock
} from '@phosphor-icons/react';
import { Article } from '@/types';
import { useKV } from '@github/spark/hooks';
import { mockMediaFiles } from '@/lib/mockData';
import { safeToLowerCase, safeToString } from '@/lib/utils';
import { toast } from 'sonner';

interface MediaFile {
  id: string;
  name: string;
  type: 'image' | 'video' | 'audio' | 'document';
  size: number;
  url: string;
  thumbnailUrl?: string;
  uploadedAt: Date;
  uploadedBy: string;
  optimized: boolean;
  compressionRatio?: number;
  originalSize?: number;
  webpUrl?: string;
  metadata: {
    width?: number;
    height?: number;
    duration?: number;
    format: string;
  };
  tags: string[];
  usageCount: number;
  lastUsed?: Date;
}

interface OptimizationSettings {
  enableCompression: boolean;
  quality: number;
  maxWidth: number;
  maxHeight: number;
  enableWebP: boolean;
  enableLazyLoading: boolean;
  enableCDN: boolean;
}

export function MediaUpload() {
  const [mediaFiles, setMediaFiles] = useKV<MediaFile[]>('sabq-media-files', mockMediaFiles);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'image' | 'video' | 'audio' | 'document'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [optimizationSettings, setOptimizationSettings] = useKV<OptimizationSettings>('optimization-settings', {
    enableCompression: true,
    quality: 85,
    maxWidth: 1920,
    maxHeight: 1080,
    enableWebP: true,
    enableLazyLoading: true,
    enableCDN: true
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setSelectedFiles(files);
  };

  const getFileType = (file: File): MediaFile['type'] => {
    const type = file.type.split('/')[0];
    switch (type) {
      case 'image': return 'image';
      case 'video': return 'video';
      case 'audio': return 'audio';
      default: return 'document';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const simulateImageOptimization = async (file: File): Promise<{
    compressedSize: number;
    webpUrl: string;
    compressionRatio: number;
  }> => {
    // Simulate AI-powered image optimization
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const originalSize = file.size;
    const compressionRatio = 0.3 + (optimizationSettings.quality / 100) * 0.5;
    const compressedSize = Math.floor(originalSize * compressionRatio);
    
    // Simulate WebP conversion
    const webpUrl = URL.createObjectURL(file) + '.webp';
    
    return {
      compressedSize,
      webpUrl,
      compressionRatio: 1 - compressionRatio
    };
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setIsUploading(true);
    
    try {
      for (const file of selectedFiles) {
        // Simulate upload progress
        for (let progress = 0; progress <= 100; progress += 10) {
          setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        const fileType = getFileType(file);
        let optimizationResult = null;
        
        // Apply optimization for images
        if (fileType === 'image' && optimizationSettings.enableCompression) {
          optimizationResult = await simulateImageOptimization(file);
          toast.success(`تم ضغط الصورة ${file.name} بنسبة ${Math.round(optimizationResult.compressionRatio * 100)}%`);
        }
        
        // Create media file record
        const newMediaFile: MediaFile = {
          id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: fileType,
          size: optimizationResult?.compressedSize || file.size,
          url: URL.createObjectURL(file),
          thumbnailUrl: fileType === 'image' ? URL.createObjectURL(file) : undefined,
          uploadedAt: new Date(),
          uploadedBy: 'current-user',
          optimized: !!optimizationResult,
          compressionRatio: optimizationResult?.compressionRatio,
          originalSize: optimizationResult ? file.size : undefined,
          webpUrl: optimizationResult?.webpUrl,
          metadata: {
            format: file.type,
            width: fileType === 'image' ? 1920 : undefined,
            height: fileType === 'image' ? 1080 : undefined,
            duration: fileType === 'video' || fileType === 'audio' ? 120 : undefined
          },
          tags: [],
          usageCount: 0
        };
        
        setMediaFiles(current => [...current, newMediaFile]);
      }
      
      toast.success(`تم رفع ${selectedFiles.length} ملف بنجاح`);
      setSelectedFiles([]);
      setUploadProgress({});
      
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('خطأ في رفع الملفات');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = (fileId: string) => {
    setMediaFiles(current => current.filter(f => f.id !== fileId));
    toast.success('تم حذف الملف');
  };

  const handleOptimizeExisting = async (fileId: string) => {
    const file = mediaFiles.find(f => f.id === fileId);
    if (!file || file.type !== 'image') return;
    
    try {
      // Simulate optimization
      const compressionRatio = 0.4;
      const newSize = Math.floor(file.size * (1 - compressionRatio));
      
      setMediaFiles(current => current.map(f => 
        f.id === fileId ? {
          ...f,
          optimized: true,
          originalSize: f.size,
          size: newSize,
          compressionRatio: compressionRatio,
          webpUrl: f.url + '.webp'
        } : f
      ));
      
      toast.success(`تم تحسين الصورة بنسبة ${Math.round(compressionRatio * 100)}%`);
    } catch (error) {
      toast.error('خطأ في تحسين الصورة');
    }
  };

  const filteredFiles = mediaFiles.filter(file => {
    const matchesFilter = filter === 'all' || file.type === filter;
    const safeName = safeToLowerCase(safeToString(file.name));
    const safeSearchTerm = safeToLowerCase(safeToString(searchTerm));
    const matchesSearch = safeName.includes(safeSearchTerm) ||
                         file.tags.some(tag => safeToLowerCase(safeToString(tag)).includes(safeSearchTerm));
    return matchesFilter && matchesSearch;
  });

  const getFileIcon = (type: MediaFile['type']) => {
    switch (type) {
      case 'image': return ImageIcon;
      case 'video': return Video;
      case 'audio': return Music;
      default: return File;
    }
  };

  const getTotalStorageUsed = () => {
    return mediaFiles.reduce((total, file) => total + file.size, 0);
  };

  const getOptimizationSavings = () => {
    return mediaFiles.reduce((total, file) => {
      if (file.optimized && file.originalSize) {
        return total + (file.originalSize - file.size);
      }
      return total;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CloudArrowUp className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">مكتبة الوسائط</h1>
            <p className="text-muted-foreground">إدارة ملفات الوسائط مع التحسين الذكي</p>
          </div>
        </div>
      </div>

      {/* Storage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CloudArrowUp className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">المساحة المستخدمة</p>
                <p className="text-2xl font-bold">{formatFileSize(getTotalStorageUsed())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <File className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الملفات</p>
                <p className="text-2xl font-bold">{mediaFiles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">ملفات محسنة</p>
                <p className="text-2xl font-bold">{mediaFiles.filter(f => f.optimized).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">مساحة موفرة</p>
                <p className="text-2xl font-bold">{formatFileSize(getOptimizationSavings())}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle>رفع ملفات جديدة</CardTitle>
          <CardDescription>
            سيتم تحسين الصور تلقائياً باستخدام الذكاء الاصطناعي
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
              onChange={handleFileSelect}
              className="mb-4"
            />
            
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">الملفات المحددة:</h4>
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                    <div className="flex items-center gap-2">
                      <File className="h-4 w-4" />
                      <span className="text-sm">{file.name}</span>
                      <Badge variant="outline">{formatFileSize(file.size)}</Badge>
                    </div>
                    {uploadProgress[file.name] && (
                      <div className="flex items-center gap-2">
                        <Progress value={uploadProgress[file.name]} className="w-20" />
                        <span className="text-xs">{uploadProgress[file.name]}%</span>
                      </div>
                    )}
                  </div>
                ))}
                
                <Button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full"
                >
                  {isUploading ? 'جاري الرفع...' : 'رفع الملفات'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            إعدادات التحسين
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>جودة الضغط ({optimizationSettings.quality}%)</Label>
              <Input
                type="range"
                min="30"
                max="100"
                value={optimizationSettings.quality}
                onChange={(e) => setOptimizationSettings(prev => ({
                  ...prev,
                  quality: parseInt(e.target.value)
                }))}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>أقصى عرض (بكسل)</Label>
              <Input
                type="number"
                value={optimizationSettings.maxWidth}
                onChange={(e) => setOptimizationSettings(prev => ({
                  ...prev,
                  maxWidth: parseInt(e.target.value)
                }))}
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>أقصى ارتفاع (بكسل)</Label>
              <Input
                type="number"
                value={optimizationSettings.maxHeight}
                onChange={(e) => setOptimizationSettings(prev => ({
                  ...prev,
                  maxHeight: parseInt(e.target.value)
                }))}
                className="mt-2"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={optimizationSettings.enableWebP}
                onChange={(e) => setOptimizationSettings(prev => ({
                  ...prev,
                  enableWebP: e.target.checked
                }))}
              />
              <span className="text-sm">تحويل إلى WebP</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={optimizationSettings.enableCDN}
                onChange={(e) => setOptimizationSettings(prev => ({
                  ...prev,
                  enableCDN: e.target.checked
                }))}
              />
              <span className="text-sm">استخدام CDN</span>
            </label>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={optimizationSettings.enableLazyLoading}
                onChange={(e) => setOptimizationSettings(prev => ({
                  ...prev,
                  enableLazyLoading: e.target.checked
                }))}
              />
              <span className="text-sm">التحميل التدريجي</span>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* File Browser */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>مكتبة الملفات</CardTitle>
            <div className="flex items-center gap-2">
              <Input
                placeholder="البحث في الملفات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-48"
              />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">جميع الملفات</option>
                <option value="image">الصور</option>
                <option value="video">الفيديو</option>
                <option value="audio">الصوت</option>
                <option value="document">المستندات</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredFiles.map((file) => {
              const FileIcon = getFileIcon(file.type);
              
              return (
                <Card key={file.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      {file.type === 'image' ? (
                        <img
                          src={file.thumbnailUrl}
                          alt={file.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <FileIcon className="h-12 w-12 text-muted-foreground" />
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm truncate" title={file.name}>
                        {file.name}
                      </h4>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatFileSize(file.size)}</span>
                        <div className="flex items-center gap-1">
                          {file.optimized ? (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                        </div>
                      </div>
                      
                      {file.optimized && file.compressionRatio && (
                        <Badge variant="secondary" className="text-xs">
                          حُسنت بنسبة {Math.round(file.compressionRatio * 100)}%
                        </Badge>
                      )}
                      
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                          <Download className="h-3 w-3" />
                        </Button>
                        {file.type === 'image' && !file.optimized && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-7 w-7 p-0"
                            onClick={() => handleOptimizeExisting(file.id)}
                          >
                            <Sparkles className="h-3 w-3" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(file.id)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
          
          {filteredFiles.length === 0 && (
            <div className="text-center py-12">
              <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">لا توجد ملفات</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'لم يتم العثور على ملفات تطابق البحث' : 'ابدأ برفع ملفاتك الأولى'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}