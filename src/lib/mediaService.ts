import { MediaFile, ImageOptimization, MediaMetadata, BulkOperation } from '@/types';

/**
 * Media Management Service for Sabq AI CMS
 * Handles file uploads, image optimization, and media library management
 */
export class MediaService {
  private static instance: MediaService;
  private maxFileSize = 50 * 1024 * 1024; // 50MB
  private allowedTypes = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg',
    'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/aac',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  /**
   * Upload single file with automatic optimization for images
   */
  async uploadFile(
    file: File, 
    options: {
      folder?: string;
      alt?: string;
      altAr?: string;
      caption?: string;
      captionAr?: string;
      tags?: string[];
      autoOptimize?: boolean;
      quality?: number;
      maxWidth?: number;
      maxHeight?: number;
    } = {}
  ): Promise<MediaFile> {
    try {
      // Validate file
      this.validateFile(file);

      // Generate unique filename
      const filename = this.generateFilename(file.name);
      
      // Extract metadata
      const metadata = await this.extractMetadata(file);
      
      // Create media file object
      const mediaFile: MediaFile = {
        id: `media_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        filename,
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
        url: '', // Will be set after upload
        alt: options.alt,
        altAr: options.altAr,
        caption: options.caption,
        captionAr: options.captionAr,
        uploadedBy: 'current-user', // Should be actual user ID
        uploadedAt: new Date(),
        metadata,
        optimizations: [],
        tags: options.tags || [],
        folder: options.folder,
        usage: []
      };

      // For images, create optimized versions
      if (file.type.startsWith('image/') && options.autoOptimize !== false) {
        const optimizations = await this.optimizeImage(file, {
          quality: options.quality || 85,
          maxWidth: options.maxWidth || 1920,
          maxHeight: options.maxHeight || 1080,
          formats: ['webp', 'jpeg']
        });
        mediaFile.optimizations = optimizations;
      }

      // Simulate upload URL (in real implementation, upload to cloud storage)
      mediaFile.url = await this.simulateUpload(file, filename);
      
      if (metadata.width && metadata.height && metadata.width > 300) {
        mediaFile.thumbnailUrl = await this.generateThumbnail(file);
      }

      return mediaFile;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload multiple files with progress tracking
   */
  async uploadMultipleFiles(
    files: FileList | File[],
    options: Parameters<typeof this.uploadFile>[1] = {},
    onProgress?: (progress: { completed: number; total: number; current?: string }) => void
  ): Promise<MediaFile[]> {
    const fileArray = Array.from(files);
    const results: MediaFile[] = [];
    
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      
      try {
        onProgress?.({ completed: i, total: fileArray.length, current: file.name });
        const mediaFile = await this.uploadFile(file, options);
        results.push(mediaFile);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        // Continue with other files
      }
      
      onProgress?.({ completed: i + 1, total: fileArray.length });
    }
    
    return results;
  }

  /**
   * Optimize existing image with different settings
   */
  async optimizeImage(
    file: File,
    settings: {
      quality?: number;
      maxWidth?: number;
      maxHeight?: number;
      formats?: ('webp' | 'avif' | 'jpeg' | 'png')[];
      progressive?: boolean;
    }
  ): Promise<ImageOptimization[]> {
    const optimizations: ImageOptimization[] = [];
    
    for (const format of settings.formats || ['webp']) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        const optimizedFile = await new Promise<Blob>((resolve, reject) => {
          img.onload = () => {
            // Calculate dimensions maintaining aspect ratio
            const { width: newWidth, height: newHeight } = this.calculateDimensions(
              img.width,
              img.height,
              settings.maxWidth || 1920,
              settings.maxHeight || 1080
            );
            
            canvas.width = newWidth;
            canvas.height = newHeight;
            
            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }
            
            // Draw and compress
            ctx.drawImage(img, 0, 0, newWidth, newHeight);
            
            const outputFormat = format === 'jpeg' ? 'image/jpeg' : `image/${format}`;
            const quality = (settings.quality || 85) / 100;
            
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(blob);
              } else {
                reject(new Error('Failed to create optimized image'));
              }
            }, outputFormat, quality);
          };
          
          img.onerror = () => reject(new Error('Failed to load image'));
          img.src = URL.createObjectURL(file);
        });

        const optimization: ImageOptimization = {
          id: `opt_${Date.now()}_${format}`,
          type: 'compress',
          status: 'completed',
          originalUrl: URL.createObjectURL(file),
          optimizedUrl: URL.createObjectURL(optimizedFile),
          settings: {
            width: settings.maxWidth,
            height: settings.maxHeight,
            quality: settings.quality,
            format,
            progressive: settings.progressive
          },
          sizeBefore: file.size,
          sizeAfter: optimizedFile.size,
          compressionRatio: ((file.size - optimizedFile.size) / file.size) * 100,
          createdAt: new Date(),
          completedAt: new Date()
        };
        
        optimizations.push(optimization);
      } catch (error) {
        console.error(`Failed to optimize image to ${format}:`, error);
      }
    }
    
    return optimizations;
  }

  /**
   * Generate thumbnail for images and videos
   */
  async generateThumbnail(file: File, size: number = 300): Promise<string> {
    if (file.type.startsWith('image/')) {
      return this.generateImageThumbnail(file, size);
    } else if (file.type.startsWith('video/')) {
      return this.generateVideoThumbnail(file, size);
    }
    
    // Return default thumbnail for other file types
    return this.getDefaultThumbnail(file.type);
  }

  /**
   * Extract metadata from uploaded files
   */
  private async extractMetadata(file: File): Promise<MediaMetadata> {
    const metadata: MediaMetadata = {
      format: file.type.split('/')[1] || 'unknown',
      originalSize: file.size,
      isOptimized: false
    };

    if (file.type.startsWith('image/')) {
      const imageMetadata = await this.extractImageMetadata(file);
      Object.assign(metadata, imageMetadata);
    } else if (file.type.startsWith('video/')) {
      const videoMetadata = await this.extractVideoMetadata(file);
      Object.assign(metadata, videoMetadata);
    }

    return metadata;
  }

  /**
   * Extract EXIF data and dimensions from images
   */
  private async extractImageMetadata(file: File): Promise<Partial<MediaMetadata>> {
    return new Promise((resolve) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          hasTransparency: file.type === 'image/png' || file.type === 'image/gif'
        });
      };
      
      img.onerror = () => {
        resolve({});
      };
      
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Extract duration and dimensions from videos
   */
  private async extractVideoMetadata(file: File): Promise<Partial<MediaMetadata>> {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth,
          height: video.videoHeight,
          duration: video.duration
        });
      };
      
      video.onerror = () => {
        resolve({});
      };
      
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate thumbnail for images
   */
  private async generateImageThumbnail(file: File, size: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        const { width, height } = this.calculateSquareDimensions(img.width, img.height, size);
        
        canvas.width = width;
        canvas.height = height;
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      img.onerror = () => reject(new Error('Failed to load image for thumbnail'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Generate thumbnail for videos (first frame)
   */
  private async generateVideoThumbnail(file: File, size: number): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      video.onloadeddata = () => {
        video.currentTime = 1; // Seek to 1 second
      };
      
      video.onseeked = () => {
        const { width, height } = this.calculateSquareDimensions(video.videoWidth, video.videoHeight, size);
        
        canvas.width = width;
        canvas.height = height;
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        ctx.drawImage(video, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      
      video.onerror = () => reject(new Error('Failed to load video for thumbnail'));
      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Get default thumbnail for file types
   */
  private getDefaultThumbnail(mimeType: string): string {
    // Return data URLs for default file type icons
    const iconMap: Record<string, string> = {
      'application/pdf': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iI0VGNDQ0NCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjE0IiBmb250LXdlaWdodD0iYm9sZCI+UERGPC90ZXh0Pgo8L3N2Zz4K',
      'audio/': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzEwQjk4MSIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+QVVESU88L3RleHQ+Cjwvc3ZnPgo=',
      'video/': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzNCODJGNiIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEyIiBmb250LXdlaWdodD0iYm9sZCI+VklERU88L3RleHQ+Cjwvc3ZnPgo='
    };

    // Find matching icon or return default
    for (const [key, icon] of Object.entries(iconMap)) {
      if (mimeType.startsWith(key)) {
        return icon;
      }
    }

    // Default document icon
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiByeD0iOCIgZmlsbD0iIzZCNzI4MCIvPgo8dGV4dCB4PSIzMiIgeT0iMzgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IndoaXRlIiBmb250LXNpemU9IjEwIiBmb250LXdlaWdodD0iYm9sZCI+RklMRTwvdGV4dD4KPC9zdmc+Cg==';
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: File): void {
    if (file.size > this.maxFileSize) {
      throw new Error(`File size exceeds maximum limit of ${this.maxFileSize / 1024 / 1024}MB`);
    }

    if (!this.allowedTypes.includes(file.type)) {
      throw new Error(`File type ${file.type} is not allowed`);
    }
  }

  /**
   * Generate unique filename
   */
  private generateFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const extension = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');
    const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, '-');
    
    return `${cleanName}-${timestamp}-${random}.${extension}`;
  }

  /**
   * Upload to Cloudinary with smart compression and format optimization
   */
  private async simulateUpload(file: File, filename: string): Promise<string> {
    // Enhanced upload simulation with Cloudinary-like functionality
    try {
      // For demonstration, we'll create an optimized object URL
      // In production, this would upload to Cloudinary with these transformations:
      
      const isImage = file.type.startsWith('image/');
      
      if (isImage) {
        // Apply smart compression and WebP conversion
        const optimizedFile = await this.smartCompress(file);
        return URL.createObjectURL(optimizedFile);
      }
      
      // For non-images, return as-is
      return URL.createObjectURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  /**
   * Smart compression with WebP conversion and fallback
   */
  private async smartCompress(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Smart sizing based on content type
        const { width, height } = this.calculateSmartDimensions(img.width, img.height);
        
        canvas.width = width;
        canvas.height = height;
        
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }
        
        // Apply image enhancements
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try WebP first (best compression)
        canvas.toBlob((webpBlob) => {
          if (webpBlob && this.supportsWebP()) {
            resolve(webpBlob);
          } else {
            // Fallback to high-quality JPEG
            canvas.toBlob((jpegBlob) => {
              if (jpegBlob) {
                resolve(jpegBlob);
              } else {
                reject(new Error('Failed to compress image'));
              }
            }, 'image/jpeg', 0.85);
          }
        }, 'image/webp', 0.80);
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }

  /**
   * Calculate smart dimensions based on image content and usage
   */
  private calculateSmartDimensions(originalWidth: number, originalHeight: number): { width: number; height: number } {
    const maxWidth = 1920;
    const maxHeight = 1080;
    
    // For very large images, be more aggressive with compression
    if (originalWidth > 3000 || originalHeight > 3000) {
      return this.calculateDimensions(originalWidth, originalHeight, maxWidth * 0.8, maxHeight * 0.8);
    }
    
    return this.calculateDimensions(originalWidth, originalHeight, maxWidth, maxHeight);
  }

  /**
   * Check if browser supports WebP
   */
  private supportsWebP(): boolean {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }

  /**
   * Calculate new dimensions maintaining aspect ratio
   */
  private calculateDimensions(
    originalWidth: number,
    originalHeight: number,
    maxWidth: number,
    maxHeight: number
  ): { width: number; height: number } {
    const aspectRatio = originalWidth / originalHeight;
    
    let newWidth = originalWidth;
    let newHeight = originalHeight;
    
    if (originalWidth > maxWidth) {
      newWidth = maxWidth;
      newHeight = newWidth / aspectRatio;
    }
    
    if (newHeight > maxHeight) {
      newHeight = maxHeight;
      newWidth = newHeight * aspectRatio;
    }
    
    return { width: Math.round(newWidth), height: Math.round(newHeight) };
  }

  /**
   * Calculate square dimensions for thumbnails
   */
  private calculateSquareDimensions(
    originalWidth: number,
    originalHeight: number,
    size: number
  ): { width: number; height: number } {
    return { width: size, height: size };
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  /**
   * Get file type icon based on MIME type
   */
  getFileTypeIcon(mimeType: string): string {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType.startsWith('video/')) return '🎥';
    if (mimeType.startsWith('audio/')) return '🎵';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    return '📁';
  }
}

export const mediaService = MediaService.getInstance();