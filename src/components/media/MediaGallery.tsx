import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Plus, 
  X, 
  Image as ImageIcon, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Copy, 
  Download,
  Edit,
  Trash2,
  Move,
  Settings
} from '@phosphor-icons/react';
import { toast } from 'sonner';
import { MediaFile } from '@/types';
import { mediaService } from '@/lib/mediaService';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedTypography } from '@/hooks/useOptimizedTypography';
import { cn } from '@/lib/utils';
import { MediaPicker } from './MediaPicker';

interface MediaGalleryProps {
  images: MediaFile[];
  onChange: (images: MediaFile[]) => void;
  maxImages?: number;
  allowReorder?: boolean;
  showCaptions?: boolean;
  className?: string;
}

export function MediaGallery({
  images,
  onChange,
  maxImages = 10,
  allowReorder = true,
  showCaptions = true,
  className
}: MediaGalleryProps) {
  const { language } = useAuth();
  const typography = useOptimizedTypography();
  const { isRTL, isArabic } = typography;
  
  const [showPicker, setShowPicker] = useState(false);
  const [editingImage, setEditingImage] = useState<MediaFile | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const addImages = (newImages: MediaFile | MediaFile[]) => {
    const imagesToAdd = Array.isArray(newImages) ? newImages : [newImages];
    const updatedImages = [...images, ...imagesToAdd].slice(0, maxImages);
    onChange(updatedImages);
    
    toast.success(
      isArabic 
        ? `تم إضافة ${imagesToAdd.length} صورة`
        : `Added ${imagesToAdd.length} image(s)`
    );
  };

  const removeImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    onChange(updatedImages);
    
    toast.success(isArabic ? 'تم حذف الصورة' : 'Image removed');
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (!allowReorder) return;
    
    const updatedImages = [...images];
    const [movedImage] = updatedImages.splice(fromIndex, 1);
    updatedImages.splice(toIndex, 0, movedImage);
    onChange(updatedImages);
  };

  const updateImageMetadata = (index: number, updates: Partial<MediaFile>) => {
    const updatedImages = images.map((img, i) => 
      i === index ? { ...img, ...updates } : img
    );
    onChange(updatedImages);
    setEditingImage(null);
    
    toast.success(isArabic ? 'تم تحديث بيانات الصورة' : 'Image metadata updated');
  };

  const copyImageUrl = (image: MediaFile) => {
    navigator.clipboard.writeText(image.url);
    toast.success(isArabic ? 'تم نسخ رابط الصورة' : 'Image URL copied');
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!allowReorder) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!allowReorder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    if (!allowReorder || draggedIndex === null) return;
    e.preventDefault();
    
    if (draggedIndex !== dropIndex) {
      moveImage(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-base font-medium">
            {isArabic ? 'معرض الصور' : 'Image Gallery'}
          </Label>
          <p className="text-sm text-muted-foreground">
            {isArabic 
              ? `${images.length} من ${maxImages} صور`
              : `${images.length} of ${maxImages} images`
            }
          </p>
        </div>
        
        {images.length < maxImages && (
          <Button
            onClick={() => setShowPicker(true)}
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            {isArabic ? 'إضافة صور' : 'Add Images'}
          </Button>
        )}
      </div>

      {/* Gallery Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <Card
              key={image.id}
              className={cn(
                "group cursor-move transition-all duration-200 hover:shadow-md",
                draggedIndex === index && "opacity-50",
                !allowReorder && "cursor-default"
              )}
              draggable={allowReorder}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
            >
              <CardContent className="p-2">
                {/* Image */}
                <div className="relative aspect-square overflow-hidden rounded bg-muted mb-2">
                  <img
                    src={image.thumbnailUrl || image.url}
                    alt={image.alt || image.originalName}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Index badge */}
                  <div className="absolute top-1 left-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                    {index + 1}
                  </div>
                  
                  {/* Actions overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-1"
                      onClick={() => setEditingImage(image)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-1"
                      onClick={() => copyImageUrl(image)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-8 w-8 p-1"
                      onClick={() => window.open(image.url, '_blank')}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-8 w-8 p-1"
                      onClick={() => removeImage(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  {/* Reorder controls */}
                  {allowReorder && images.length > 1 && (
                    <div className="absolute top-1 right-1 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {index > 0 && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 w-6 p-1"
                          onClick={() => moveImage(index, index - 1)}
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                      )}
                      {index < images.length - 1 && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-6 w-6 p-1"
                          onClick={() => moveImage(index, index + 1)}
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Image info */}
                <div className="space-y-1">
                  <p className="text-xs font-medium truncate" title={image.originalName}>
                    {image.originalName}
                  </p>
                  
                  {image.metadata.width && image.metadata.height && (
                    <p className="text-xs text-muted-foreground">
                      {image.metadata.width} × {image.metadata.height}
                    </p>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    {mediaService.formatFileSize(image.size)}
                  </p>
                  
                  {showCaptions && (image.caption || image.captionAr) && (
                    <p className="text-xs text-muted-foreground truncate">
                      {isArabic ? image.captionAr || image.caption : image.caption || image.captionAr}
                    </p>
                  )}
                  
                  {image.optimizations.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {isArabic ? 'محسّن' : 'Optimized'}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Empty state */
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">
              {isArabic ? 'لا توجد صور' : 'No images added'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {isArabic 
                ? 'انقر على "إضافة صور" لإضافة صور لمعرض المقال'
                : 'Click "Add Images" to add photos to your article gallery'
              }
            </p>
            <Button onClick={() => setShowPicker(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {isArabic ? 'إضافة صور' : 'Add Images'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Usage tips */}
      {images.length > 0 && allowReorder && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded">
          <p>
            {isArabic 
              ? 'يمكنك سحب وإفلات الصور لإعادة ترتيبها، أو استخدام أسهم الترتيب'
              : 'Drag and drop images to reorder them, or use the arrow buttons'
            }
          </p>
        </div>
      )}

      {/* Media Picker Dialog */}
      <MediaPicker
        open={showPicker}
        onOpenChange={setShowPicker}
        onSelect={addImages}
        multiple={true}
        allowedTypes={['image']}
        title={isArabic ? 'اختيار صور للمعرض' : 'Select Gallery Images'}
        description={isArabic 
          ? `يمكنك اختيار حتى ${maxImages - images.length} صور إضافية`
          : `You can select up to ${maxImages - images.length} more images`
        }
      />

      {/* Edit Image Dialog */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {isArabic ? 'تحرير بيانات الصورة' : 'Edit Image Details'}
            </DialogTitle>
            <DialogDescription>
              {isArabic ? 'تحديث النص البديل والتعليق للصورة' : 'Update alt text and caption for the image'}
            </DialogDescription>
          </DialogHeader>
          
          {editingImage && (
            <ImageEditForm
              image={editingImage}
              onSave={(updates) => {
                const index = images.findIndex(img => img.id === editingImage.id);
                if (index !== -1) {
                  updateImageMetadata(index, updates);
                }
              }}
              onCancel={() => setEditingImage(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Image Edit Form Component
interface ImageEditFormProps {
  image: MediaFile;
  onSave: (updates: Partial<MediaFile>) => void;
  onCancel: () => void;
}

function ImageEditForm({ image, onSave, onCancel }: ImageEditFormProps) {
  const { language } = useAuth();
  const typography = useOptimizedTypography();
  const { isArabic } = typography;
  
  const [alt, setAlt] = useState(image.alt || '');
  const [altAr, setAltAr] = useState(image.altAr || '');
  const [caption, setCaption] = useState(image.caption || '');
  const [captionAr, setCaptionAr] = useState(image.captionAr || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSave({
      alt: alt.trim() || undefined,
      altAr: altAr.trim() || undefined,
      caption: caption.trim() || undefined,
      captionAr: captionAr.trim() || undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Image Preview */}
      <div className="flex gap-4">
        <div className="w-32 h-32 bg-muted rounded overflow-hidden flex-shrink-0">
          <img
            src={image.thumbnailUrl || image.url}
            alt={image.alt || image.originalName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 space-y-2">
          <h4 className="font-medium">{image.originalName}</h4>
          <p className="text-sm text-muted-foreground">
            {image.metadata.width} × {image.metadata.height} • {mediaService.formatFileSize(image.size)}
          </p>
          {image.optimizations.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {isArabic ? 'محسّن' : 'Optimized'} ({image.optimizations.length} {isArabic ? 'تحسينات' : 'optimizations'})
            </Badge>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-alt">{isArabic ? 'النص البديل (EN)' : 'Alt Text (EN)'}</Label>
          <Input
            id="edit-alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder={isArabic ? 'وصف الصورة بالإنجليزية' : 'Describe the image in English'}
          />
        </div>
        <div>
          <Label htmlFor="edit-alt-ar">{isArabic ? 'النص البديل (AR)' : 'Alt Text (AR)'}</Label>
          <Input
            id="edit-alt-ar"
            value={altAr}
            onChange={(e) => setAltAr(e.target.value)}
            placeholder={isArabic ? 'وصف الصورة بالعربية' : 'Describe the image in Arabic'}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-caption">{isArabic ? 'التعليق (EN)' : 'Caption (EN)'}</Label>
          <Textarea
            id="edit-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={isArabic ? 'تعليق اختياري بالإنجليزية' : 'Optional caption in English'}
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="edit-caption-ar">{isArabic ? 'التعليق (AR)' : 'Caption (AR)'}</Label>
          <Textarea
            id="edit-caption-ar"
            value={captionAr}
            onChange={(e) => setCaptionAr(e.target.value)}
            placeholder={isArabic ? 'تعليق اختياري بالعربية' : 'Optional caption in Arabic'}
            rows={3}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          {isArabic ? 'إلغاء' : 'Cancel'}
        </Button>
        <Button type="submit">
          {isArabic ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}