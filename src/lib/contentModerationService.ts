import { Article, ModerationFlag, ContentAnalysis } from '@/types';

export interface ModerationRule {
  id: string;
  name: string;
  nameAr: string;
  type: 'sensitivity' | 'bias' | 'profanity' | 'legal' | 'factual' | 'quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  pattern?: string | RegExp;
  keywords?: string[];
  keywordsAr?: string[];
  description: string;
  descriptionAr: string;
  autoReject?: boolean;
  requiresHumanReview?: boolean;
  active: boolean;
}

export interface ModerationResult {
  articleId: string;
  status: 'approved' | 'flagged' | 'rejected' | 'requires-review';
  score: number; // 0-100, higher = more problematic
  flags: ModerationFlag[];
  languageDetection: {
    primary: 'ar' | 'en' | 'mixed';
    confidence: number;
    arabicRatio: number;
  };
  contentAnalysis: {
    sensitiveTopics: string[];
    biasIndicators: string[];
    factualConcerns: string[];
    qualityIssues: string[];
    readabilityScore: number;
    sentimentScore: number;
  };
  recommendations: string[];
  autoApproved: boolean;
  requiresReview: boolean;
  moderatedAt: Date;
}

export interface ModerationSettings {
  autoApprovalThreshold: number; // 0-100
  requireReviewThreshold: number; // 0-100
  enabledRules: string[];
  strictMode: boolean;
  enableAIAnalysis: boolean;
  notifyEditorsOnFlag: boolean;
  logAllModeration: boolean;
}

/**
 * AI-Powered Content Moderation Service for Arabic News Content
 * Provides intelligent content analysis, bias detection, and editorial workflow integration
 */
export class ContentModerationService {
  private static instance: ContentModerationService;
  private moderationRules: ModerationRule[] = [];
  private settings: ModerationSettings = {
    autoApprovalThreshold: 85,
    requireReviewThreshold: 60,
    enabledRules: [],
    strictMode: false,
    enableAIAnalysis: true,
    notifyEditorsOnFlag: true,
    logAllModeration: true
  };

  // Default moderation rules
  private readonly defaultRules: ModerationRule[] = [
    {
      id: 'arabic-profanity',
      name: 'Arabic Profanity Detection',
      nameAr: 'كشف الألفاظ النابية العربية',
      type: 'profanity',
      severity: 'high',
      keywordsAr: [
        'كلمات', 'نابية', 'مسيئة', // Placeholder - would include actual profanity list
      ],
      keywords: ['inappropriate', 'offensive'], // English equivalents
      description: 'Detects profanity and inappropriate language in Arabic content',
      descriptionAr: 'يكتشف الألفاظ النابية والغير مناسبة في المحتوى العربي',
      autoReject: true,
      requiresHumanReview: false,
      active: true
    },
    {
      id: 'sensitive-political',
      name: 'Sensitive Political Content',
      nameAr: 'المحتوى السياسي الحساس',
      type: 'sensitivity',
      severity: 'medium',
      keywords: ['politics', 'government', 'protest', 'opposition'],
      keywordsAr: ['سياسة', 'حكومة', 'احتجاج', 'معارضة', 'مظاهرة'],
      description: 'Flags content with sensitive political themes',
      descriptionAr: 'يعلم على المحتوى ذو المواضيع السياسية الحساسة',
      autoReject: false,
      requiresHumanReview: true,
      active: true
    },
    {
      id: 'religious-sensitivity',
      name: 'Religious Sensitivity',
      nameAr: 'الحساسية الدينية',
      type: 'sensitivity',
      severity: 'high',
      keywords: ['religion', 'faith', 'blasphemy', 'sacred'],
      keywordsAr: ['دين', 'مقدس', 'تجديف', 'عقيدة', 'كفر'],
      description: 'Detects potentially offensive religious content',
      descriptionAr: 'يكتشف المحتوى الديني المسيء المحتمل',
      autoReject: false,
      requiresHumanReview: true,
      active: true
    },
    {
      id: 'bias-detection',
      name: 'Bias Detection',
      nameAr: 'كشف التحيز',
      type: 'bias',
      severity: 'medium',
      keywords: ['always', 'never', 'all', 'none', 'clearly', 'obviously'],
      keywordsAr: ['دائماً', 'أبداً', 'جميع', 'لا أحد', 'بوضوح', 'من الواضح'],
      description: 'Identifies potentially biased language and absolute statements',
      descriptionAr: 'يحدد اللغة المتحيزة المحتملة والتصريحات المطلقة',
      autoReject: false,
      requiresHumanReview: false,
      active: true
    },
    {
      id: 'misinformation-indicators',
      name: 'Misinformation Indicators',
      nameAr: 'مؤشرات المعلومات المضللة',
      type: 'factual',
      severity: 'critical',
      keywords: ['conspiracy', 'hoax', 'fake', 'unverified', 'rumor'],
      keywordsAr: ['مؤامرة', 'خدعة', 'مزيف', 'غير موثق', 'شائعة', 'إشاعة'],
      description: 'Flags potential misinformation and unverified claims',
      descriptionAr: 'يعلم على المعلومات المضللة المحتملة والادعاءات غير الموثقة',
      autoReject: false,
      requiresHumanReview: true,
      active: true
    },
    {
      id: 'quality-check',
      name: 'Content Quality Check',
      nameAr: 'فحص جودة المحتوى',
      type: 'quality',
      severity: 'low',
      description: 'Checks for basic quality issues like length, grammar, and structure',
      descriptionAr: 'يفحص مشاكل الجودة الأساسية مثل الطول والنحو والهيكل',
      autoReject: false,
      requiresHumanReview: false,
      active: true
    }
  ];

  static getInstance(): ContentModerationService {
    if (!ContentModerationService.instance) {
      ContentModerationService.instance = new ContentModerationService();
    }
    return ContentModerationService.instance;
  }

  constructor() {
    this.moderationRules = [...this.defaultRules];
    this.settings.enabledRules = this.defaultRules.map(rule => rule.id);
  }

  /**
   * Moderate an article using AI and rule-based analysis
   */
  async moderateArticle(article: Article): Promise<ModerationResult> {
    const moderationStart = Date.now();
    
    try {
      // 1. Language Detection
      const languageDetection = await this.detectLanguage(article);
      
      // 2. AI-powered content analysis
      const contentAnalysis = await this.analyzeContent(article, languageDetection);
      
      // 3. Rule-based moderation
      const ruleFlags = await this.applyModerationRules(article, languageDetection);
      
      // 4. AI-enhanced flags
      const aiFlags = await this.generateAIFlags(article, contentAnalysis);
      
      // 5. Combine all flags
      const allFlags = [...ruleFlags, ...aiFlags];
      
      // 6. Calculate overall moderation score
      const score = this.calculateModerationScore(allFlags, contentAnalysis);
      
      // 7. Determine status
      const status = this.determineStatus(score, allFlags);
      
      // 8. Generate recommendations
      const recommendations = await this.generateRecommendations(article, allFlags, contentAnalysis);
      
      const result: ModerationResult = {
        articleId: article.id,
        status,
        score,
        flags: allFlags,
        languageDetection,
        contentAnalysis,
        recommendations,
        autoApproved: status === 'approved' && score >= this.settings.autoApprovalThreshold,
        requiresReview: status === 'requires-review' || score <= this.settings.requireReviewThreshold,
        moderatedAt: new Date()
      };

      // Log moderation result
      if (this.settings.logAllModeration) {
        console.log(`Content moderation completed for article ${article.id}:`, {
          status: result.status,
          score: result.score,
          flagsCount: allFlags.length,
          processingTime: Date.now() - moderationStart
        });
      }

      return result;
    } catch (error) {
      console.error('Content moderation failed:', error);
      
      // Fallback to manual review on error
      return {
        articleId: article.id,
        status: 'requires-review',
        score: 50,
        flags: [{
          id: `error_${Date.now()}`,
          type: 'factual',
          severity: 'medium',
          description: 'Moderation system error - requires manual review',
          autoDetected: true,
          resolved: false,
          createdAt: new Date()
        }],
        languageDetection: {
          primary: article.language as 'ar' | 'en' | 'mixed',
          confidence: 0.5,
          arabicRatio: 0.5
        },
        contentAnalysis: {
          sensitiveTopics: [],
          biasIndicators: [],
          factualConcerns: ['System error during analysis'],
          qualityIssues: [],
          readabilityScore: 50,
          sentimentScore: 0
        },
        recommendations: ['Manual review required due to system error'],
        autoApproved: false,
        requiresReview: true,
        moderatedAt: new Date()
      };
    }
  }

  /**
   * Detect the primary language and calculate Arabic content ratio
   */
  private async detectLanguage(article: Article): Promise<ModerationResult['languageDetection']> {
    const fullText = `${article.title} ${article.content} ${article.excerpt}`;
    
    // Count Arabic characters
    const arabicChars = fullText.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/g) || [];
    const totalChars = fullText.replace(/\s/g, '').length;
    const arabicRatio = totalChars > 0 ? arabicChars.length / totalChars : 0;
    
    let primary: 'ar' | 'en' | 'mixed';
    let confidence: number;
    
    if (arabicRatio > 0.7) {
      primary = 'ar';
      confidence = arabicRatio;
    } else if (arabicRatio < 0.3) {
      primary = 'en';
      confidence = 1 - arabicRatio;
    } else {
      primary = 'mixed';
      confidence = Math.min(arabicRatio, 1 - arabicRatio) * 2;
    }
    
    return {
      primary,
      confidence,
      arabicRatio
    };
  }

  /**
   * AI-powered content analysis using LLM
   */
  private async analyzeContent(article: Article, languageDetection: ModerationResult['languageDetection']): Promise<ModerationResult['contentAnalysis']> {
    if (!this.settings.enableAIAnalysis) {
      return {
        sensitiveTopics: [],
        biasIndicators: [],
        factualConcerns: [],
        qualityIssues: [],
        readabilityScore: 75,
        sentimentScore: 0
      };
    }

    try {
      const prompt = spark.llmPrompt`
        Analyze this news article for content moderation in an Arabic news organization.
        
        Title: ${article.title}
        Content: ${article.content.substring(0, 2000)}
        Language: ${languageDetection.primary}
        
        Analyze for:
        1. Sensitive topics (politics, religion, social issues)
        2. Bias indicators (loaded language, unfair representation)
        3. Factual concerns (unverified claims, conspiracy theories)
        4. Quality issues (grammar, structure, clarity)
        5. Readability score (1-100)
        6. Sentiment score (-1 to 1)
        
        Consider Arabic cultural context and sensitivity.
        
        Return JSON format:
        {
          "sensitiveTopics": ["topic1", "topic2"],
          "biasIndicators": ["indicator1", "indicator2"],
          "factualConcerns": ["concern1", "concern2"],
          "qualityIssues": ["issue1", "issue2"],
          "readabilityScore": 85,
          "sentimentScore": 0.2
        }
      `;

      const analysisResult = await spark.llm(prompt, "gpt-4o", true);
      const parsed = JSON.parse(analysisResult);
      
      return {
        sensitiveTopics: parsed.sensitiveTopics || [],
        biasIndicators: parsed.biasIndicators || [],
        factualConcerns: parsed.factualConcerns || [],
        qualityIssues: parsed.qualityIssues || [],
        readabilityScore: Math.max(0, Math.min(100, parsed.readabilityScore || 75)),
        sentimentScore: Math.max(-1, Math.min(1, parsed.sentimentScore || 0))
      };
    } catch (error) {
      console.error('AI content analysis failed:', error);
      return {
        sensitiveTopics: [],
        biasIndicators: [],
        factualConcerns: [],
        qualityIssues: ['AI analysis failed'],
        readabilityScore: 50,
        sentimentScore: 0
      };
    }
  }

  /**
   * Apply rule-based moderation
   */
  private async applyModerationRules(article: Article, languageDetection: ModerationResult['languageDetection']): Promise<ModerationFlag[]> {
    const flags: ModerationFlag[] = [];
    const fullText = `${article.title} ${article.content} ${article.excerpt}`.toLowerCase();
    
    for (const rule of this.moderationRules) {
      if (!rule.active || !this.settings.enabledRules.includes(rule.id)) continue;
      
      let matched = false;
      let matchedTerms: string[] = [];
      
      // Check keywords based on detected language
      if (languageDetection.primary === 'ar' && rule.keywordsAr) {
        for (const keyword of rule.keywordsAr) {
          if (fullText.includes(keyword.toLowerCase())) {
            matched = true;
            matchedTerms.push(keyword);
          }
        }
      }
      
      if ((languageDetection.primary === 'en' || languageDetection.primary === 'mixed') && rule.keywords) {
        for (const keyword of rule.keywords) {
          if (fullText.includes(keyword.toLowerCase())) {
            matched = true;
            matchedTerms.push(keyword);
          }
        }
      }
      
      // Check regex patterns
      if (rule.pattern && !matched) {
        const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern, 'i') : rule.pattern;
        if (regex.test(fullText)) {
          matched = true;
          matchedTerms.push('pattern match');
        }
      }
      
      if (matched) {
        flags.push({
          id: `rule_${rule.id}_${Date.now()}`,
          type: rule.type,
          severity: rule.severity,
          description: `${rule.name}: Found prohibited content - ${matchedTerms.join(', ')}`,
          autoDetected: true,
          resolved: false,
          createdAt: new Date()
        });
      }
    }
    
    return flags;
  }

  /**
   * Generate AI-enhanced flags based on content analysis
   */
  private async generateAIFlags(article: Article, analysis: ModerationResult['contentAnalysis']): Promise<ModerationFlag[]> {
    const flags: ModerationFlag[] = [];
    
    // Flag sensitive topics
    if (analysis.sensitiveTopics.length > 0) {
      flags.push({
        id: `ai_sensitive_${Date.now()}`,
        type: 'sensitivity',
        severity: analysis.sensitiveTopics.length > 2 ? 'high' : 'medium',
        description: `Sensitive topics detected: ${analysis.sensitiveTopics.join(', ')}`,
        autoDetected: true,
        resolved: false,
        createdAt: new Date()
      });
    }
    
    // Flag bias indicators
    if (analysis.biasIndicators.length > 1) {
      flags.push({
        id: `ai_bias_${Date.now()}`,
        type: 'bias',
        severity: 'medium',
        description: `Potential bias detected: ${analysis.biasIndicators.join(', ')}`,
        autoDetected: true,
        resolved: false,
        createdAt: new Date()
      });
    }
    
    // Flag factual concerns
    if (analysis.factualConcerns.length > 0) {
      flags.push({
        id: `ai_factual_${Date.now()}`,
        type: 'factual',
        severity: 'high',
        description: `Factual concerns: ${analysis.factualConcerns.join(', ')}`,
        autoDetected: true,
        resolved: false,
        createdAt: new Date()
      });
    }
    
    // Flag quality issues
    if (analysis.readabilityScore < 40 || analysis.qualityIssues.length > 2) {
      flags.push({
        id: `ai_quality_${Date.now()}`,
        type: 'quality' as any,
        severity: 'low',
        description: `Quality issues: Low readability (${analysis.readabilityScore}) or structural problems`,
        autoDetected: true,
        resolved: false,
        createdAt: new Date()
      });
    }
    
    return flags;
  }

  /**
   * Calculate overall moderation score
   */
  private calculateModerationScore(flags: ModerationFlag[], analysis: ModerationResult['contentAnalysis']): number {
    let score = 100; // Start with perfect score
    
    // Deduct points for flags
    flags.forEach(flag => {
      switch (flag.severity) {
        case 'critical':
          score -= 40;
          break;
        case 'high':
          score -= 25;
          break;
        case 'medium':
          score -= 15;
          break;
        case 'low':
          score -= 5;
          break;
      }
    });
    
    // Factor in readability
    if (analysis.readabilityScore < 50) {
      score -= (50 - analysis.readabilityScore) * 0.5;
    }
    
    // Factor in extreme sentiment
    if (Math.abs(analysis.sentimentScore) > 0.8) {
      score -= 10;
    }
    
    return Math.max(0, Math.min(100, score));
  }

  /**
   * Determine moderation status
   */
  private determineStatus(score: number, flags: ModerationFlag[]): ModerationResult['status'] {
    const hasCriticalFlag = flags.some(flag => flag.severity === 'critical');
    const hasAutoRejectFlag = flags.some(flag => {
      const rule = this.moderationRules.find(r => flag.description.includes(r.name));
      return rule?.autoReject;
    });
    
    if (hasAutoRejectFlag || hasCriticalFlag) {
      return 'rejected';
    }
    
    if (score >= this.settings.autoApprovalThreshold && flags.length === 0) {
      return 'approved';
    }
    
    if (score <= this.settings.requireReviewThreshold || flags.length > 0) {
      return 'requires-review';
    }
    
    return 'flagged';
  }

  /**
   * Generate AI-powered recommendations
   */
  private async generateRecommendations(
    article: Article, 
    flags: ModerationFlag[], 
    analysis: ModerationResult['contentAnalysis']
  ): Promise<string[]> {
    if (flags.length === 0) {
      return ['Content approved - no issues detected'];
    }
    
    try {
      const flagsSummary = flags.map(flag => `${flag.type}: ${flag.description}`).join('; ');
      
      const prompt = spark.llmPrompt`
        Generate specific editorial recommendations for this Arabic news article based on moderation flags:
        
        Article Title: ${article.title}
        Detected Issues: ${flagsSummary}
        Readability Score: ${analysis.readabilityScore}
        
        Provide 3-5 specific, actionable recommendations for the editor to address these issues.
        Consider Arabic journalistic standards and cultural sensitivity.
        
        Format as a simple array of strings.
      `;
      
      const recommendations = await spark.llm(prompt, "gpt-4o-mini");
      
      // Parse the response and extract recommendations
      const lines = recommendations.split('\n').filter(line => line.trim().length > 0);
      return lines.slice(0, 5);
    } catch (error) {
      console.error('Failed to generate AI recommendations:', error);
      
      // Fallback recommendations
      const fallback = ['Review flagged content for compliance with editorial guidelines'];
      
      if (analysis.readabilityScore < 50) {
        fallback.push('Improve content readability and structure');
      }
      
      if (flags.some(f => f.type === 'sensitivity')) {
        fallback.push('Review sensitive content for cultural appropriateness');
      }
      
      if (flags.some(f => f.type === 'bias')) {
        fallback.push('Ensure balanced and objective reporting');
      }
      
      return fallback;
    }
  }

  /**
   * Get moderation settings
   */
  getSettings(): ModerationSettings {
    return { ...this.settings };
  }

  /**
   * Update moderation settings
   */
  updateSettings(newSettings: Partial<ModerationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * Get all moderation rules
   */
  getModerationRules(): ModerationRule[] {
    return [...this.moderationRules];
  }

  /**
   * Add custom moderation rule
   */
  addModerationRule(rule: Omit<ModerationRule, 'id'>): string {
    const id = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newRule: ModerationRule = { ...rule, id };
    this.moderationRules.push(newRule);
    return id;
  }

  /**
   * Update moderation rule
   */
  updateModerationRule(id: string, updates: Partial<ModerationRule>): boolean {
    const index = this.moderationRules.findIndex(rule => rule.id === id);
    if (index === -1) return false;
    
    this.moderationRules[index] = { ...this.moderationRules[index], ...updates };
    return true;
  }

  /**
   * Delete moderation rule
   */
  deleteModerationRule(id: string): boolean {
    const index = this.moderationRules.findIndex(rule => rule.id === id);
    if (index === -1) return false;
    
    this.moderationRules.splice(index, 1);
    this.settings.enabledRules = this.settings.enabledRules.filter(ruleId => ruleId !== id);
    return true;
  }

  /**
   * Quick moderation check for real-time feedback
   */
  async quickModerationCheck(text: string): Promise<{
    issues: string[];
    severity: 'none' | 'low' | 'medium' | 'high';
    safe: boolean;
  }> {
    const issues: string[] = [];
    let maxSeverity: 'none' | 'low' | 'medium' | 'high' = 'none';
    
    // Quick keyword check
    for (const rule of this.moderationRules) {
      if (!rule.active) continue;
      
      const keywords = [...(rule.keywords || []), ...(rule.keywordsAr || [])];
      for (const keyword of keywords) {
        if (text.toLowerCase().includes(keyword.toLowerCase())) {
          issues.push(`Potential ${rule.type}: ${keyword}`);
          if (rule.severity === 'critical' || rule.severity === 'high') {
            maxSeverity = 'high';
          } else if (rule.severity === 'medium' && maxSeverity !== 'high') {
            maxSeverity = 'medium';
          } else if (rule.severity === 'low' && maxSeverity === 'none') {
            maxSeverity = 'low';
          }
        }
      }
    }
    
    return {
      issues: issues.slice(0, 5), // Limit to first 5 issues
      severity: maxSeverity,
      safe: maxSeverity === 'none' || maxSeverity === 'low'
    };
  }
}

export const contentModerationService = ContentModerationService.getInstance();