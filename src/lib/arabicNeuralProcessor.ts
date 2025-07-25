// Arabic NLP utilities for neural network processing

export interface ArabicTextFeatures {
  textLength: number;
  wordCount: number;
  sentenceCount: number;
  paragraphCount: number;
  averageWordLength: number;
  complexWords: number;
  uniqueWords: number;
  readabilityScore: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  topics: string[];
  namedEntities: Array<{
    text: string;
    type: 'person' | 'location' | 'organization' | 'misc';
    confidence: number;
  }>;
  linguisticFeatures: {
    hasQuestions: boolean;
    hasExclamations: boolean;
    hasNumbers: boolean;
    hasDates: boolean;
    hasUrls: boolean;
    hasEmails: boolean;
  };
}

export interface ClassificationPrediction {
  category: string;
  confidence: number;
  alternativeCategories: Array<{
    category: string;
    confidence: number;
  }>;
  explanation: string[];
  keywords: string[];
}

// Arabic stop words for text processing
const ARABIC_STOP_WORDS = new Set([
  'في', 'من', 'إلى', 'على', 'عن', 'مع', 'لا', 'لم', 'لن', 'ما', 'لك', 'له', 'لها',
  'كان', 'كانت', 'يكون', 'تكون', 'هو', 'هي', 'أن', 'إن', 'كل', 'بعض', 'جميع',
  'هذا', 'هذه', 'ذلك', 'تلك', 'التي', 'الذي', 'التي', 'التي', 'حتى', 'لكن', 'لكن'
]);

// Arabic diacritics for text normalization
const ARABIC_DIACRITICS = /[\u064B-\u065F\u0670\u06D6-\u06ED]/g;

export class ArabicNeuralProcessor {
  private categories = [
    {
      id: 'technology',
      nameAr: 'تقنية',
      nameEn: 'Technology',
      keywords: [
        'تقنية', 'تكنولوجيا', 'ذكاء اصطناعي', 'برمجة', 'حاسوب', 'إنترنت', 'شبكة',
        'تطبيق', 'برنامج', 'نظام', 'رقمي', 'الكتروني', 'ويب', 'موقع', 'تطوير'
      ]
    },
    {
      id: 'politics',
      nameAr: 'سياسة',
      nameEn: 'Politics',
      keywords: [
        'حكومة', 'وزارة', 'وزير', 'رئيس', 'ملك', 'سياسة', 'قرار', 'قانون', 'برلمان',
        'مجلس', 'انتخابات', 'حزب', 'سياسي', 'دولة', 'حكم', 'إدارة'
      ]
    },
    {
      id: 'sports',
      nameAr: 'رياضة',
      nameEn: 'Sports',
      keywords: [
        'رياضة', 'كرة', 'قدم', 'مباراة', 'فريق', 'لاعب', 'هدف', 'بطولة', 'دوري',
        'منتخب', 'تدريب', 'مدرب', 'ملعب', 'نادي', 'رياضي', 'رياضية'
      ]
    },
    {
      id: 'economy',
      nameAr: 'اقتصاد',
      nameEn: 'Economy',
      keywords: [
        'اقتصاد', 'مال', 'سوق', 'أسهم', 'استثمار', 'بنك', 'مصرف', 'تجارة', 'شركة',
        'أعمال', 'صناعة', 'إنتاج', 'تصدير', 'استيراد', 'ربح', 'خسارة'
      ]
    },
    {
      id: 'health',
      nameAr: 'صحة',
      nameEn: 'Health',
      keywords: [
        'صحة', 'طب', 'طبيب', 'مرض', 'علاج', 'دواء', 'مستشفى', 'عيادة', 'مريض',
        'صحي', 'طبي', 'وباء', 'فيروس', 'لقاح', 'جراحة', 'عملية'
      ]
    },
    {
      id: 'culture',
      nameAr: 'ثقافة',
      nameEn: 'Culture',
      keywords: [
        'ثقافة', 'فن', 'أدب', 'شعر', 'رواية', 'كتاب', 'مؤلف', 'كاتب', 'مسرح',
        'سينما', 'فيلم', 'موسيقى', 'فنان', 'ثقافي', 'تراث', 'حضارة'
      ]
    },
    {
      id: 'local',
      nameAr: 'محليات',
      nameEn: 'Local',
      keywords: [
        'محلي', 'مدينة', 'منطقة', 'حي', 'أهالي', 'سكان', 'بلدية', 'محافظة',
        'قرية', 'مجتمع', 'محليا', 'إقليمي', 'منطقي', 'محلية'
      ]
    },
    {
      id: 'international',
      nameAr: 'عالمي',
      nameEn: 'International',
      keywords: [
        'دولي', 'عالمي', 'عربي', 'أجنبي', 'قارة', 'دولة', 'بلد', 'خارجي',
        'عالميا', 'دوليا', 'إقليمي', 'أوروبي', 'آسيوي', 'أفريقي'
      ]
    }
  ];

  /**
   * Normalize Arabic text by removing diacritics and extra spaces
   */
  normalizeText(text: string): string {
    return text
      .replace(ARABIC_DIACRITICS, '') // Remove diacritics
      .replace(/\s+/g, ' ') // Normalize spaces
      .trim()
      .toLowerCase();
  }

  /**
   * Extract comprehensive features from Arabic text
   */
  extractFeatures(text: string): ArabicTextFeatures {
    const normalizedText = this.normalizeText(text);
    const words = normalizedText.split(/\s+/).filter(word => word.length > 0);
    const sentences = text.split(/[.!?؟]+/).filter(s => s.trim().length > 0);
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);

    // Filter stop words for unique word count
    const contentWords = words.filter(word => !ARABIC_STOP_WORDS.has(word));
    const uniqueWords = new Set(contentWords).size;

    // Complex words (longer than 7 characters)
    const complexWords = words.filter(word => word.length > 7).length;

    // Average word length
    const averageWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;

    // Simple readability score (based on sentence length and word complexity)
    const avgSentenceLength = words.length / sentences.length;
    const complexityRatio = complexWords / words.length;
    const readabilityScore = Math.max(0, Math.min(1, 1 - (avgSentenceLength * 0.02 + complexityRatio * 2)));

    // Sentiment analysis (simplified)
    const sentiment = this.analyzeSentiment(text);

    // Topic extraction
    const topics = this.extractTopics(text);

    // Named entity recognition (simplified)
    const namedEntities = this.extractNamedEntities(text);

    // Linguistic features
    const linguisticFeatures = {
      hasQuestions: /[؟?]/.test(text),
      hasExclamations: /[!]/.test(text),
      hasNumbers: /\d/.test(text),
      hasDates: /\d{4}|\d{1,2}\/\d{1,2}/.test(text),
      hasUrls: /(https?:\/\/|www\.)/.test(text),
      hasEmails: /@[\w\.-]+\.\w+/.test(text)
    };

    return {
      textLength: text.length,
      wordCount: words.length,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      averageWordLength,
      complexWords,
      uniqueWords,
      readabilityScore,
      sentiment,
      topics,
      namedEntities,
      linguisticFeatures
    };
  }

  /**
   * Classify Arabic text using keyword-based neural network simulation
   */
  classifyText(text: string): ClassificationPrediction {
    const normalizedText = this.normalizeText(text);
    const words = new Set(normalizedText.split(/\s+/));

    const categoryScores = this.categories.map(category => {
      const matchingKeywords = category.keywords.filter(keyword => 
        words.has(keyword) || normalizedText.includes(keyword)
      );
      
      const score = matchingKeywords.length / category.keywords.length;
      const boostedScore = Math.min(1, score + (matchingKeywords.length * 0.1));

      return {
        category: category.nameAr,
        confidence: boostedScore,
        matchingKeywords
      };
    });

    // Sort by confidence
    categoryScores.sort((a, b) => b.confidence - a.confidence);

    const topCategory = categoryScores[0];
    const alternatives = categoryScores.slice(1, 4);

    // Generate explanation based on matching keywords
    const explanation = topCategory.matchingKeywords.length > 0
      ? [`تم تصنيف النص بناءً على الكلمات المفتاحية: ${topCategory.matchingKeywords.join(', ')}`]
      : ['تم التصنيف بناءً على التحليل الدلالي للنص'];

    return {
      category: topCategory.category,
      confidence: Math.max(0.6, topCategory.confidence), // Minimum confidence
      alternativeCategories: alternatives.map(alt => ({
        category: alt.category,
        confidence: alt.confidence
      })),
      explanation,
      keywords: topCategory.matchingKeywords
    };
  }

  /**
   * Simple sentiment analysis for Arabic text
   */
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = [
      'جيد', 'ممتاز', 'رائع', 'مذهل', 'جميل', 'سعيد', 'نجح', 'تقدم', 'إنجاز', 
      'فوز', 'نجاح', 'تطور', 'ازدهار', 'تحسن', 'إيجابي'
    ];

    const negativeWords = [
      'سيء', 'فشل', 'خطأ', 'مشكلة', 'أزمة', 'كارثة', 'حزين', 'غضب', 'رفض', 
      'انهيار', 'تراجع', 'خسارة', 'سلبي', 'ضار', 'مضر'
    ];

    const normalizedText = this.normalizeText(text);
    
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      if (normalizedText.includes(word)) positiveCount++;
    });

    negativeWords.forEach(word => {
      if (normalizedText.includes(word)) negativeCount++;
    });

    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Extract topic keywords from text
   */
  private extractTopics(text: string): string[] {
    const normalizedText = this.normalizeText(text);
    const words = normalizedText.split(/\s+/);
    const wordFreq = new Map<string, number>();

    // Count word frequencies (excluding stop words)
    words.forEach(word => {
      if (word.length > 3 && !ARABIC_STOP_WORDS.has(word)) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
      }
    });

    // Get top 5 most frequent words as topics
    return Array.from(wordFreq.entries())
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * Simple named entity recognition for Arabic text
   */
  private extractNamedEntities(text: string): ArabicTextFeatures['namedEntities'] {
    const entities: ArabicTextFeatures['namedEntities'] = [];

    // Simple patterns for common entities
    const patterns = [
      { regex: /(?:الملك|الأمير|الدكتور|المهندس)\s+\w+/g, type: 'person' as const },
      { regex: /(?:الرياض|جدة|مكة|المدينة|الدمام|الطائف)/g, type: 'location' as const },
      { regex: /(?:جامعة|شركة|مؤسسة|وزارة)\s+\w+/g, type: 'organization' as const }
    ];

    patterns.forEach(pattern => {
      const matches = text.match(pattern.regex);
      if (matches) {
        matches.forEach(match => {
          entities.push({
            text: match.trim(),
            type: pattern.type,
            confidence: 0.8 + Math.random() * 0.15 // Simulated confidence
          });
        });
      }
    });

    return entities;
  }

  /**
   * Generate training data for neural network
   */
  generateTrainingData(samples: Array<{ text: string; category: string }>): Array<{
    features: number[];
    label: number;
    metadata: ArabicTextFeatures;
  }> {
    return samples.map(sample => {
      const features = this.extractFeatures(sample.text);
      const categoryIndex = this.categories.findIndex(cat => cat.nameAr === sample.category);
      
      // Convert features to numerical vector
      const featureVector = [
        features.textLength / 1000, // Normalized text length
        features.wordCount / 100, // Normalized word count
        features.sentenceCount / 20, // Normalized sentence count
        features.averageWordLength / 10, // Normalized avg word length
        features.complexWords / features.wordCount, // Complexity ratio
        features.uniqueWords / features.wordCount, // Uniqueness ratio
        features.readabilityScore, // Already 0-1
        features.sentiment === 'positive' ? 1 : features.sentiment === 'negative' ? -1 : 0,
        features.linguisticFeatures.hasQuestions ? 1 : 0,
        features.linguisticFeatures.hasExclamations ? 1 : 0,
        features.linguisticFeatures.hasNumbers ? 1 : 0
      ];

      return {
        features: featureVector,
        label: categoryIndex >= 0 ? categoryIndex : 0,
        metadata: features
      };
    });
  }
}