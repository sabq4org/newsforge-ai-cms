// 🎙️ Sabq Althakiyah Audio System - Complete Export Module
// نظام الصوت المتكامل لمنصة سبق الذكية - وحدة التصدير الكاملة

// Core Audio Components
export { AudioEditor } from './AudioEditor';
export { AudioLibrary } from './AudioLibrary';
export { AudioAnalytics } from './AudioAnalytics';

// Advanced TTS and AI Components
export { TTSConfig } from './TTSConfig';
export { AdvancedTTSControls } from './AdvancedTTSControls';

// Media and Library Management
export { AudioLibraryBrowser } from './AudioLibraryBrowser';

// Export and Sharing
export { PodcastExporter } from './PodcastExporter';

// Services and Utilities
export * from '../services/elevenlabs';

// Type Definitions
export interface AudioSegment {
  id: string;
  text: string;
  startTime: number;
  duration: number;
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  pause: {
    before: number;
    after: number;
  };
  effects: {
    fade: { in: number; out: number };
    echo: number;
    reverb: number;
    noise: boolean;
  };
  type: 'text' | 'intro' | 'outro' | 'transition' | 'music' | 'sfx';
  isLocked: boolean;
  audioUrl?: string;
  audioBlob?: Blob;
  optimizedText?: string;
  elevenLabsVoiceId?: string;
  elevenLabsSettings?: {
    stability: number;
    similarity_boost: number;
    style: number;
    use_speaker_boost: boolean;
  };
  generationStatus?: 'pending' | 'generating' | 'completed' | 'failed';
  generationProgress?: number;
}

export interface AudioProject {
  id: string;
  name: string;
  articleId: string;
  article: any; // Article type
  segments: AudioSegment[];
  globalSettings: {
    outputFormat: 'mp3' | 'wav' | 'aac';
    sampleRate: 22050 | 44100 | 48000;
    bitrate: 128 | 192 | 256 | 320;
    normalize: boolean;
    limitPeaks: boolean;
    backgroundMusic: {
      enabled: boolean;
      url?: string;
      volume: number;
      fadeIn: number;
      fadeOut: number;
    };
  };
  metadata: {
    title: string;
    author: string;
    description: string;
    language: 'ar' | 'en';
    genre: string;
    thumbnail?: string;
    website?: string;
    copyright?: string;
  };
  status: 'draft' | 'processing' | 'completed' | 'failed';
  outputUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  waveformData?: number[];
}

export interface BackgroundMusic {
  id: string;
  name: string;
  nameEn: string;
  category: 'intro' | 'background' | 'transition' | 'outro' | 'ambient' | 'news' | 'tech' | 'corporate';
  duration: number;
  bpm?: number;
  key?: string;
  mood: 'calm' | 'energetic' | 'professional' | 'warm' | 'serious' | 'uplifting' | 'dramatic';
  tags: string[];
  url?: string;
  preview_url?: string;
  volume_recommendation: number;
  fade_in_recommendation: number;
  fade_out_recommendation: number;
  loop_point?: number;
  suitable_for: string[];
  description: string;
  license: 'free' | 'premium' | 'custom';
  artist?: string;
  created_at: Date;
  usage_count: number;
  rating: number;
  is_favorite: boolean;
  is_royalty_free: boolean;
}

export interface SoundEffect {
  id: string;
  name: string;
  nameEn: string;
  category: 'notification' | 'transition' | 'emphasis' | 'environment' | 'mechanical' | 'nature' | 'digital';
  duration: number;
  tags: string[];
  url?: string;
  preview_url?: string;
  description: string;
  use_cases: string[];
  volume_recommendation: number;
  is_loop: boolean;
  fade_settings?: {
    in: number;
    out: number;
  };
}

export interface TTSSettings {
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

export interface ExportOptions {
  format: 'mp3' | 'wav' | 'aac';
  quality: 'low' | 'medium' | 'high' | 'lossless';
  normalize: boolean;
  addMetadata: boolean;
  generateWaveform: boolean;
  createChapters: boolean;
  addIntroOutro: boolean;
  backgroundMusic: boolean;
  outputName?: string;
}

export interface ExportResult {
  success: boolean;
  outputUrl?: string;
  duration?: number;
  fileSize?: number;
  format?: string;
  metadata?: any;
  socialCards?: {
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  error?: string;
}

// Utility Functions
export const AudioUtils = {
  // Format duration in MM:SS or HH:MM:SS
  formatDuration: (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  // Calculate estimated file size
  estimateFileSize: (durationSeconds: number, format: string, quality: string): string => {
    const bitrates: Record<string, Record<string, number>> = {
      mp3: { low: 128, medium: 192, high: 256, lossless: 320 },
      wav: { low: 256, medium: 320, high: 512, lossless: 1411 },
      aac: { low: 128, medium: 192, high: 256, lossless: 320 }
    };

    const bitrate = bitrates[format]?.[quality] || 192;
    const sizeKb = (durationSeconds * bitrate) / 8;
    const sizeMb = sizeKb / 1024;
    
    return sizeMb > 1 ? `${sizeMb.toFixed(1)} ميجابايت` : `${sizeKb.toFixed(0)} كيلوبايت`;
  },

  // Generate waveform data from audio
  generateWaveform: async (audioBlob: Blob): Promise<number[]> => {
    return new Promise((resolve) => {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          
          const channelData = audioBuffer.getChannelData(0);
          const samples = 200; // Number of waveform points
          const blockSize = Math.floor(channelData.length / samples);
          const waveform: number[] = [];
          
          for (let i = 0; i < samples; i++) {
            const start = i * blockSize;
            let sum = 0;
            
            for (let j = 0; j < blockSize; j++) {
              sum += Math.abs(channelData[start + j]);
            }
            
            waveform.push(sum / blockSize);
          }
          
          resolve(waveform);
        } catch (error) {
          console.error('Error generating waveform:', error);
          resolve(Array(200).fill(0.5)); // Fallback
        }
      };
      
      reader.readAsArrayBuffer(audioBlob);
    });
  },

  // Download audio file
  downloadAudio: (blob: Blob | string, filename: string): void => {
    try {
      let url: string;
      
      if (typeof blob === 'string') {
        url = blob;
      } else {
        url = URL.createObjectURL(blob);
      }

      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      if (typeof blob !== 'string') {
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading audio:', error);
      throw new Error('Failed to download audio file');
    }
  },

  // Get audio metadata
  getAudioMetadata: async (audioBlob: Blob): Promise<{
    duration: number;
    size: number;
    type: string;
    sampleRate?: number;
  }> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(audioBlob);
      
      audio.addEventListener('loadedmetadata', () => {
        resolve({
          duration: audio.duration,
          size: audioBlob.size,
          type: audioBlob.type,
          sampleRate: undefined // Not available in browser
        });
        
        URL.revokeObjectURL(url);
      });
      
      audio.addEventListener('error', () => {
        reject(new Error('Failed to load audio metadata'));
        URL.revokeObjectURL(url);
      });
      
      audio.src = url;
    });
  }
};

// Constants
export const SUPPORTED_AUDIO_FORMATS = ['mp3', 'wav', 'aac', 'ogg', 'm4a'] as const;
export const MAX_AUDIO_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const DEFAULT_SAMPLE_RATE = 44100;
export const DEFAULT_BITRATE = 192;

// Arabic Voice Presets
export const ARABIC_VOICE_PRESETS = {
  NEWS_FORMAL: {
    voice: 'fahad_premium',
    speed: 1.0,
    pitch: 1.0,
    stability: 0.8,
    similarity_boost: 0.9,
    style: 0.2
  },
  PODCAST_CASUAL: {
    voice: 'layla_modern',
    speed: 1.1,
    pitch: 1.0,
    stability: 0.6,
    similarity_boost: 0.8,
    style: 0.5
  },
  EDUCATIONAL: {
    voice: 'ahmed_warm',
    speed: 0.9,
    pitch: 1.0,
    stability: 0.7,
    similarity_boost: 0.85,
    style: 0.3
  }
} as const;

// Success! 🎉 All audio components exported successfully
// تم تصدير جميع مكونات النظام الصوتي بنجاح! 🎉