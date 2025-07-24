import { ContentAnalysis, AIOptimization, PredictiveAnalytics, ABTestVariant } from '@/types';

/**
 * Sabq Althakiyah AI Service
 * Provides Arabic-aware AI functionality for content optimization
 */
export class SabqAIService {
  
  /**
   * Generate Arabic content optimizations using OpenAI
   */
  static async generateContentOptimizations(
    content: string, 
    type: 'headline' | 'summary' | 'tone' | 'structure' | 'seo',
    targetAudience?: string
  ): Promise<AIOptimization[]> {
    try {
      const prompt = spark.llmPrompt`
        أنت محرر صحفي خبير في الإعلام العربي. قم بتحليل وتحسين المحتوى التالي:

        المحتوى: ${content}
        نوع التحسين المطلوب: ${type}
        الجمهور المستهدف: ${targetAudience || 'الجمهور العربي العام'}

        المطلوب:
        1. اقتراح تحسينات محددة
        2. تقدير نسبة التحسن المتوقعة
        3. شرح سبب كل اقتراح
        4. مراعاة الثقافة العربية والحساسيات المحلية

        أجب بصيغة JSON مع هذا التنسيق:
        {
          "optimizations": [
            {
              "suggestion": "نص الاقتراح",
              "originalText": "النص الأصلي",
              "optimizedText": "النص المحسن",
              "reason": "سبب التحسين",
              "impact": "readability|engagement|seo|clarity|tone",
              "estimatedImprovement": رقم_النسبة,
              "priority": "low|medium|high"
            }
          ]
        }
      `;

      const response = await spark.llm(prompt, 'gpt-4o', true);
      const data = JSON.parse(response);
      
      return data.optimizations.map((opt: any, index: number) => ({
        id: `opt_${Date.now()}_${index}`,
        articleId: '', // Will be set by caller
        type,
        priority: opt.priority,
        suggestion: opt.suggestion,
        originalText: opt.originalText,
        optimizedText: opt.optimizedText,
        reason: opt.reason,
        impact: opt.impact,
        estimatedImprovement: opt.estimatedImprovement,
        applied: false,
        createdAt: new Date()
      }));
    } catch (error) {
      console.error('AI optimization error:', error);
      return [];
    }
  }

  /**
   * Analyze Arabic content for readability, tone, and SEO
   */
  static async analyzeContent(content: string, title: string): Promise<ContentAnalysis> {
    try {
      const prompt = spark.llmPrompt`
        قم بتحليل شامل للمحتوى العربي التالي:

        العنوان: ${title}
        المحتوى: ${content}

        المطلوب تحليل:
        1. مستوى سهولة القراءة (0-100)
        2. تحليل النبرة والمشاعر
        3. تحليل SEO والكلمات المفتاحية
        4. تحليل البنية والتنظيم
        5. اكتشاف اللغة
        6. اقتراحات للتحسين

        أجب بصيغة JSON:
        {
          "readabilityScore": رقم,
          "toneAnalysis": {
            "sentiment": "positive|negative|neutral",
            "formality": "formal|informal|mixed",
            "urgency": "low|medium|high",
            "emotion": ["emotion1", "emotion2"]
          },
          "seoAnalysis": {
            "keywordDensity": {"كلمة": نسبة},
            "metaDescription": "وصف مقترح",
            "suggestedTags": ["تاغ1", "تاغ2"],
            "internalLinkOpportunities": ["فرصة1", "فرصة2"]
          },
          "structureAnalysis": {
            "paragraphCount": رقم,
            "averageSentenceLength": رقم,
            "headingStructure": ["h1", "h2"],
            "wordCount": رقم
          },
          "languageDetection": "ar|en|mixed"
        }
      `;

      const response = await spark.llm(prompt, 'gpt-4o', true);
      const data = JSON.parse(response);
      
      return {
        ...data,
        optimizations: [] // Will be populated separately
      };
    } catch (error) {
      console.error('Content analysis error:', error);
      return {
        readabilityScore: 70,
        toneAnalysis: {
          sentiment: 'neutral',
          formality: 'formal',
          urgency: 'medium',
          emotion: []
        },
        seoAnalysis: {
          keywordDensity: {},
          metaDescription: '',
          suggestedTags: [],
          internalLinkOpportunities: []
        },
        structureAnalysis: {
          paragraphCount: 1,
          averageSentenceLength: 20,
          headingStructure: [],
          wordCount: content.split(' ').length
        },
        languageDetection: 'ar',
        optimizations: []
      };
    }
  }

  /**
   * Generate predictive analytics for Arabic content
   */
  static async generatePredictiveAnalytics(
    title: string,
    content: string,
    category: string,
    publishTime: Date
  ): Promise<PredictiveAnalytics> {
    try {
      const prompt = spark.llmPrompt`
        كمحلل أداء في الإعلام العربي، قم بتوقع أداء هذا المقال:

        العنوان: ${title}
        الفئة: ${category}
        وقت النشر المقترح: ${publishTime.toLocaleString('ar-SA')}
        المحتوى: ${content.substring(0, 500)}...

        حلل وتوقع:
        1. مستوى الوصول المتوقع (منخفض/متوسط/عالي)
        2. عدد المشاهدات المتوقعة
        3. معدل التفاعل المتوقع
        4. أفضل وقت للنشر
        5. العوامل المؤثرة على الأداء
        6. توصيات للتحسين

        أجب بصيغة JSON:
        {
          "reachScore": "low|medium|high",
          "confidence": رقم_0_100,
          "predictedViews": رقم,
          "predictedEngagement": رقم,
          "optimalPublishTime": "ISO_date_string",
          "factors": {
            "titleScore": رقم_0_100,
            "lengthScore": رقم_0_100,
            "categoryTrend": رقم_0_100,
            "timingScore": رقم_0_100,
            "seasonalityScore": رقم_0_100
          },
          "recommendations": ["توصية1", "توصية2", "توصية3"]
        }
      `;

      const response = await spark.llm(prompt, 'gpt-4o', true);
      const data = JSON.parse(response);
      
      return {
        ...data,
        optimalPublishTime: new Date(data.optimalPublishTime)
      };
    } catch (error) {
      console.error('Predictive analytics error:', error);
      return {
        reachScore: 'medium',
        confidence: 70,
        predictedViews: 1000,
        predictedEngagement: 50,
        optimalPublishTime: new Date(),
        factors: {
          titleScore: 70,
          lengthScore: 75,
          categoryTrend: 65,
          timingScore: 80,
          seasonalityScore: 70
        },
        recommendations: [
          'تحسين العنوان لجذب المزيد من القراء',
          'إضافة كلمات مفتاحية ذات صلة',
          'تحسين توقيت النشر'
        ]
      };
    }
  }

  /**
   * Generate A/B test variants for Arabic content
   */
  static async generateABTestVariants(
    original: string,
    type: 'headline' | 'summary' | 'thumbnail',
    variantCount: number = 3
  ): Promise<Omit<ABTestVariant, 'id' | 'performance' | 'isWinner' | 'confidence'>[]> {
    try {
      const prompt = spark.llmPrompt`
        أنشئ ${variantCount} بدائل مختلفة للـ ${type} التالي للاختبار A/B:

        النص الأصلي: ${original}

        المطلوب:
        - إنشاء ${variantCount} بدائل مختلفة
        - كل بديل يجب أن يختبر استراتيجية مختلفة (عاطفي، معلوماتي، استفهامي، إلخ)
        - مراعاة الثقافة العربية والجمهور السعودي
        - الحفاظ على المعنى الأساسي

        أجب بصيغة JSON:
        {
          "variants": [
            {
              "content": "النص البديل",
              "strategy": "وصف الاستراتيجية المستخدمة"
            }
          ]
        }
      `;

      const response = await spark.llm(prompt, 'gpt-4o', true);
      const data = JSON.parse(response);
      
      return data.variants.map((variant: any) => ({
        type,
        content: variant.content,
        performance: {
          impressions: 0,
          clicks: 0,
          ctr: 0,
          averageReadTime: 0,
          bounceRate: 0
        }
      }));
    } catch (error) {
      console.error('A/B test generation error:', error);
      return [];
    }
  }

  /**
   * Generate social media snippets for Arabic content
   */
  static async generateSocialSnippets(title: string, content: string): Promise<{
    twitter: string;
    whatsapp: string;
    facebook: string;
    linkedin: string;
  }> {
    try {
      const prompt = spark.llmPrompt`
        أنشئ منشورات لوسائل التواصل الاجتماعي للمقال التالي:

        العنوان: ${title}
        المحتوى: ${content.substring(0, 300)}...

        المطلوب إنشاء منشورات مناسبة لكل منصة:
        - تويتر: 280 حرف كحد أقصى، جذاب ومختصر
        - واتساب: 250 حرف، دعوة للقراءة
        - فيسبوك: 400 حرف، تفاعلي ومحفز للنقاش
        - لينكد إن: 300 حرف، مهني ومعلوماتي

        أجب بصيغة JSON:
        {
          "twitter": "منشور تويتر",
          "whatsapp": "منشور واتساب",
          "facebook": "منشور فيسبوك",
          "linkedin": "منشور لينكد إن"
        }
      `;

      const response = await spark.llm(prompt, 'gpt-4o', true);
      return JSON.parse(response);
    } catch (error) {
      console.error('Social snippets generation error:', error);
      return {
        twitter: title,
        whatsapp: `📰 ${title} - اقرأ المزيد`,
        facebook: `${title}\n\nما رأيكم؟ شاركونا آراءكم`,
        linkedin: `${title}\n\nتحليل مهم يستحق القراءة.`
      };
    }
  }

  /**
   * Detect potential sensitive content or moderation flags
   */
  static async detectModerationFlags(content: string): Promise<{
    flags: Array<{
      type: 'sensitivity' | 'bias' | 'factual' | 'legal';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      suggestion: string;
    }>;
    overall: 'safe' | 'review' | 'block';
  }> {
    try {
      const prompt = spark.llmPrompt`
        كمحرر مسؤول عن المراجعة، حلل المحتوى التالي للتأكد من مناسبته:

        المحتوى: ${content}

        ابحث عن:
        1. المحتوى الحساس (السياسة، الدين، القضايا الاجتماعية)
        2. التحيز أو عدم الموضوعية
        3. المعلومات التي قد تحتاج للتحقق
        4. القضايا القانونية المحتملة

        اعتبر السياق السعودي والثقافة المحلية.

        أجب بصيغة JSON:
        {
          "flags": [
            {
              "type": "sensitivity|bias|factual|legal",
              "severity": "low|medium|high|critical",
              "description": "وصف المشكلة",
              "suggestion": "اقتراح للحل"
            }
          ],
          "overall": "safe|review|block"
        }
      `;

      const response = await spark.llm(prompt, 'gpt-4o', true);
      return JSON.parse(response);
    } catch (error) {
      console.error('Moderation detection error:', error);
      return {
        flags: [],
        overall: 'safe'
      };
    }
  }
}