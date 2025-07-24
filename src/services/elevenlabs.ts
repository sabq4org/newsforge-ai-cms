import { toast } from 'sonner';

// ElevenLabs API Configuration
const ELEVENLABS_API_KEY = 'sk_8867323770dae548ec436056590d60a04ba9a8e1840ea09c';
const ELEVENLABS_BASE_URL = 'https://api.elevenlabs.io/v1';

interface ElevenLabsVoice {
  voice_id: string;
  name: string;
  preview_url?: string;
  category: string;
  labels: {
    accent?: string;
    age?: string;
    gender?: string;
    language?: string;
    use_case?: string;
  };
  settings?: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
}

interface TTSRequest {
  text: string;
  voice_id: string;
  model_id?: string;
  voice_settings: {
    stability: number;
    similarity_boost: number;
    style?: number;
    use_speaker_boost?: boolean;
  };
  pronunciation_dictionary_locators?: Array<{
    pronunciation_dictionary_id: string;
    version_id: string;
  }>;
}

interface GenerationOptions {
  voice_id: string;
  text: string;
  model_id?: string;
  stability?: number;
  similarity_boost?: number;
  style?: number;
  use_speaker_boost?: boolean;
  output_format?: 'mp3_22050_32' | 'mp3_44100_32' | 'mp3_44100_64' | 'mp3_44100_96' | 'mp3_44100_128' | 'mp3_44100_192';
  optimize_streaming_latency?: number;
  previous_text?: string;
  next_text?: string;
  previous_request_ids?: string[];
  next_request_ids?: string[];
}

class ElevenLabsService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = ELEVENLABS_API_KEY;
    this.baseUrl = ELEVENLABS_BASE_URL;
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'xi-api-key': this.apiKey,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API Error: ${response.status} - ${errorText}`);
    }

    return response;
  }

  // Get all available voices
  async getVoices(): Promise<ElevenLabsVoice[]> {
    try {
      const response = await this.makeRequest('/voices');
      const data = await response.json();
      return data.voices || [];
    } catch (error) {
      console.error('Error fetching voices:', error);
      toast.error('فشل في تحميل الأصوات المتاحة');
      return [];
    }
  }

  // Get specific voice details
  async getVoice(voiceId: string): Promise<ElevenLabsVoice | null> {
    try {
      const response = await this.makeRequest(`/voices/${voiceId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching voice details:', error);
      return null;
    }
  }

  // Generate speech from text
  async generateSpeech(options: GenerationOptions): Promise<Blob | null> {
    try {
      const {
        voice_id,
        text,
        model_id = 'eleven_multilingual_v2',
        stability = 0.5,
        similarity_boost = 0.8,
        style = 0.3,
        use_speaker_boost = true,
        output_format = 'mp3_44100_128',
        optimize_streaming_latency = 0
      } = options;

      const requestBody: TTSRequest = {
        text,
        voice_id,
        model_id,
        voice_settings: {
          stability,
          similarity_boost,
          style,
          use_speaker_boost
        }
      };

      const queryParams = new URLSearchParams({
        output_format,
        optimize_streaming_latency: optimize_streaming_latency.toString()
      });

      const response = await this.makeRequest(
        `/text-to-speech/${voice_id}?${queryParams.toString()}`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      return await response.blob();
    } catch (error) {
      console.error('Error generating speech:', error);
      toast.error('فشل في توليد الصوت');
      return null;
    }
  }

  // Stream speech generation (for real-time feedback)
  async generateSpeechStream(options: GenerationOptions): Promise<ReadableStream | null> {
    try {
      const {
        voice_id,
        text,
        model_id = 'eleven_multilingual_v2',
        stability = 0.5,
        similarity_boost = 0.8,
        style = 0.3,
        use_speaker_boost = true,
        output_format = 'mp3_44100_128',
        optimize_streaming_latency = 4
      } = options;

      const requestBody: TTSRequest = {
        text,
        voice_id,
        model_id,
        voice_settings: {
          stability,
          similarity_boost,
          style,
          use_speaker_boost
        }
      };

      const queryParams = new URLSearchParams({
        output_format,
        optimize_streaming_latency: optimize_streaming_latency.toString()
      });

      const response = await this.makeRequest(
        `/text-to-speech/${voice_id}/stream?${queryParams.toString()}`,
        {
          method: 'POST',
          body: JSON.stringify(requestBody),
        }
      );

      return response.body;
    } catch (error) {
      console.error('Error generating speech stream:', error);
      toast.error('فشل في توليد الصوت المباشر');
      return null;
    }
  }

  // Get user subscription info
  async getUserInfo() {
    try {
      const response = await this.makeRequest('/user');
      return await response.json();
    } catch (error) {
      console.error('Error fetching user info:', error);
      return null;
    }
  }

  // Get generation history
  async getHistory() {
    try {
      const response = await this.makeRequest('/history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching history:', error);
      return null;
    }
  }

  // Delete history item
  async deleteHistoryItem(historyItemId: string): Promise<boolean> {
    try {
      await this.makeRequest(`/history/${historyItemId}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      console.error('Error deleting history item:', error);
      return false;
    }
  }

  // Download history item audio
  async downloadHistoryAudio(historyItemId: string): Promise<Blob | null> {
    try {
      const response = await this.makeRequest(`/history/${historyItemId}/audio`);
      return await response.blob();
    } catch (error) {
      console.error('Error downloading history audio:', error);
      return null;
    }
  }

  // Create pronunciation dictionary (for Arabic names and terms)
  async createPronunciationDictionary(name: string, rules: Array<{ alphabet: string; phoneme: string }>) {
    try {
      const response = await this.makeRequest('/pronunciation-dictionaries/add-from-file', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description: `قاموس النطق العربي - ${name}`,
          alphabet: 'ipa',
          rules
        }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error creating pronunciation dictionary:', error);
      return null;
    }
  }
}

// Default Arabic voices mapping to ElevenLabs voice IDs
export const ARABIC_VOICE_MAPPING = {
  'fahad_premium': 'pNInz6obpgDQGcFmaJgB', // Adam - clear, male
  'sara_news': '21m00Tcm4TlvDq8ikWAM', // Rachel - professional female
  'ahmed_warm': 'AZnzlk1XvdvUeBnXmlld', // Domi - warm male
  'layla_modern': 'EXAVITQu4vr4xnSDxMaL', // Bella - modern female
  'omar_authority': 'ErXwobaYiN019PkySvjV', // Antoni - authoritative
  'nour_gentle': 'MF3mGyEYCl7XYWbV9V6O', // Elli - gentle female
};

// Voice configurations optimized for Arabic content
export const ARABIC_VOICE_CONFIGS = {
  'fahad_premium': { stability: 0.71, similarity_boost: 0.8, style: 0.3 },
  'sara_news': { stability: 0.75, similarity_boost: 0.85, style: 0.2 },
  'ahmed_warm': { stability: 0.65, similarity_boost: 0.75, style: 0.4 },
  'layla_modern': { stability: 0.6, similarity_boost: 0.8, style: 0.5 },
  'omar_authority': { stability: 0.8, similarity_boost: 0.9, style: 0.1 },
  'nour_gentle': { stability: 0.55, similarity_boost: 0.75, style: 0.6 },
};

// Create and export service instance
export const elevenLabsService = new ElevenLabsService();

// Utility functions for Arabic text optimization
export const optimizeArabicText = async (text: string): Promise<string> => {
  try {
    const prompt = spark.llmPrompt`Optimize this Arabic text for high-quality text-to-speech:

Text: "${text}"

Instructions:
- Ensure proper diacritics (تشكيل) for clarity
- Add natural pauses with periods and commas
- Convert numbers to written form in Arabic
- Expand abbreviations to full words
- Fix any grammatical issues
- Ensure proper sentence structure
- Add breathing spaces where natural
- Maintain the original meaning and tone

Return only the optimized Arabic text without any additional formatting or explanations.`;

    const optimized = await spark.llm(prompt);
    return optimized.trim();
  } catch (error) {
    console.error('Error optimizing Arabic text:', error);
    return text; // Return original if optimization fails
  }
};

// Calculate estimated duration for Arabic text
export const estimateArabicDuration = (text: string, speed: number = 1.0): number => {
  // Arabic words per minute: ~120-150 for normal speed
  const wordsPerMinute = 135 / speed;
  const wordCount = text.trim().split(/\s+/).length;
  return Math.ceil((wordCount / wordsPerMinute) * 60);
};

// Validate API key
export const validateElevenLabsKey = async (): Promise<boolean> => {
  try {
    const userInfo = await elevenLabsService.getUserInfo();
    return userInfo !== null;
  } catch (error) {
    console.error('Invalid ElevenLabs API key:', error);
    return false;
  }
};