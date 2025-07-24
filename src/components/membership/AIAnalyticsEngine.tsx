import { useState, useEffect } from 'react';
import { useKV } from '@github/spark/hooks';
import { UserProfile, UserActivity, UserInteraction, UserBehaviorAnalysis, PersonalizedRecommendation } from '@/types/membership';
import { Article } from '@/types';

interface AnalyticsEngineProps {
  userId: string;
  articles: Article[];
  onRecommendationGenerated?: (recommendations: PersonalizedRecommendation[]) => void;
}

export function useAIAnalyticsEngine({ userId, articles, onRecommendationGenerated }: AnalyticsEngineProps) {
  const [userInteractions, setUserInteractions] = useKV<UserInteraction[]>(`interactions-${userId}`, []);
  const [behaviorAnalysis, setBehaviorAnalysis] = useKV<UserBehaviorAnalysis | null>(`behavior-${userId}`, null);
  const [recommendations, setRecommendations] = useKV<PersonalizedRecommendation[]>(`recommendations-${userId}`, []);

  // Track user interaction
  const trackInteraction = async (interaction: Omit<UserInteraction, 'timestamp' | 'sessionId'>) => {
    const sessionId = `session_${Date.now()}`;
    const fullInteraction: UserInteraction = {
      ...interaction,
      sessionId,
      timestamp: new Date(),
      deviceType: getDeviceType(),
      location: { country: 'SA', city: 'Riyadh' } // Mock location
    };

    setUserInteractions(current => [...current, fullInteraction]);
    
    // Trigger analysis update
    await updateBehaviorAnalysis();
  };

  // Generate behavior analysis using AI
  const updateBehaviorAnalysis = async () => {
    if (userInteractions.length < 5) return; // Need minimum data

    try {
      const prompt = spark.llmPrompt`Analyze user behavior patterns from these interactions and generate insights:

User Interactions:
${userInteractions.slice(-50).map(interaction => 
  `- ${interaction.action} on article ${interaction.articleId} at ${interaction.timestamp} for ${interaction.duration || 0}s`
).join('\n')}

Available Articles:
${articles.slice(0, 20).map(article => 
  `- ID: ${article.id}, Title: ${article.title}, Category: ${article.category?.name}, Tags: ${article.tags?.join(', ')}`
).join('\n')}

Generate a comprehensive behavior analysis including:
1. Reading patterns (preferred times, session duration, articles per session)
2. Content preferences (top categories, content length preference)
3. Engagement metrics (interaction rate, time on site)
4. Personality profile (exploration level, social engagement, news consumption style)

Return as JSON with this structure:
{
  "readingPatterns": {
    "preferredTimes": ["morning", "evening"],
    "averageSessionDuration": 15.2,
    "averageArticlesPerSession": 3.1,
    "mostActiveDay": "Sunday",
    "readingSpeed": 250
  },
  "contentPreferences": {
    "topCategories": [
      {"category": "Technology", "percentage": 35},
      {"category": "News", "percentage": 25}
    ],
    "contentLength": "medium",
    "contentType": ["news", "analysis"]
  },
  "engagementMetrics": {
    "interactionRate": 0.78,
    "returnVisitorRate": 0.85,
    "averageTimeOnSite": 18.5,
    "bounceRate": 0.25
  },
  "personalityProfile": {
    "explorationLevel": "moderate",
    "socialEngagement": "medium", 
    "newsConsumption": "regular"
  }
}`;

      const result = await spark.llm(prompt, 'gpt-4o-mini', true);
      const analysisData = JSON.parse(result);

      const analysis: UserBehaviorAnalysis = {
        userId,
        analysisDate: new Date(),
        ...analysisData
      };

      setBehaviorAnalysis(analysis);
      
      // Generate new recommendations based on updated analysis
      await generatePersonalizedRecommendations(analysis);
      
    } catch (error) {
      console.error('Error updating behavior analysis:', error);
    }
  };

  // Generate personalized recommendations using AI
  const generatePersonalizedRecommendations = async (analysis?: UserBehaviorAnalysis) => {
    const currentAnalysis = analysis || behaviorAnalysis;
    if (!currentAnalysis) return;

    try {
      const prompt = spark.llmPrompt`Based on user behavior analysis, generate personalized article recommendations:

User Behavior Analysis:
- Top Categories: ${currentAnalysis.contentPreferences.topCategories.map(c => `${c.category} (${c.percentage}%)`).join(', ')}
- Content Types: ${currentAnalysis.contentPreferences.contentType.join(', ')}
- Exploration Level: ${currentAnalysis.personalityProfile.explorationLevel}
- Reading Patterns: ${currentAnalysis.readingPatterns.preferredTimes.join(', ')}

Recent Interactions:
${userInteractions.slice(-20).map(interaction => 
  `- ${interaction.action} on ${articles.find(a => a.id === interaction.articleId)?.title || 'Unknown'} (${interaction.action})`
).join('\n')}

Available Articles:
${articles.slice(0, 30).map(article => 
  `- ID: ${article.id}, Title: ${article.title}, Category: ${article.category?.name}, Excerpt: ${article.excerpt?.substring(0, 100)}`
).join('\n')}

Generate 8 personalized recommendations with reasons. Consider:
1. User's top categories but include some diversity
2. Exploration level (conservative users get similar content, adventurous get diverse)
3. Content types they prefer
4. Articles they haven't interacted with yet

Return as JSON array:
[
  {
    "articleId": "article_id",
    "score": 0.95,
    "reason": "Matches your interest in technology and reading patterns",
    "category": "recommendation_type"
  }
]`;

      const result = await spark.llm(prompt, 'gpt-4o-mini', true);
      const recommendationData = JSON.parse(result);

      const newRecommendations: PersonalizedRecommendation[] = recommendationData.map((rec: any) => ({
        id: `rec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        articleId: rec.articleId,
        userId,
        score: rec.score,
        reason: rec.reason,
        category: rec.category,
        timestamp: new Date(),
        viewed: false,
        clicked: false
      }));

      setRecommendations(newRecommendations);
      onRecommendationGenerated?.(newRecommendations);

    } catch (error) {
      console.error('Error generating recommendations:', error);
    }
  };

  // Get user segment based on behavior
  const getUserSegment = () => {
    if (!behaviorAnalysis) return 'new_user';

    const { engagementMetrics, personalityProfile, readingPatterns } = behaviorAnalysis;

    // High engagement users
    if (engagementMetrics.interactionRate > 0.8 && engagementMetrics.returnVisitorRate > 0.9) {
      return 'power_user';
    }

    // Casual but consistent users
    if (engagementMetrics.returnVisitorRate > 0.7 && readingPatterns.averageSessionDuration > 10) {
      return 'regular_reader';
    }

    // Exploratory users
    if (personalityProfile.explorationLevel === 'adventurous') {
      return 'explorer';
    }

    // News-focused users
    if (personalityProfile.newsConsumption === 'heavy') {
      return 'news_junkie';
    }

    return 'casual_reader';
  };

  // Mark recommendation as viewed
  const markRecommendationViewed = (recommendationId: string) => {
    setRecommendations(current =>
      current.map(rec =>
        rec.id === recommendationId ? { ...rec, viewed: true } : rec
      )
    );
  };

  // Mark recommendation as clicked
  const markRecommendationClicked = (recommendationId: string) => {
    setRecommendations(current =>
      current.map(rec =>
        rec.id === recommendationId ? { ...rec, clicked: true } : rec
      )
    );
  };

  // Get device type (simplified)
  const getDeviceType = (): 'mobile' | 'tablet' | 'desktop' => {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  // Initialize behavior analysis if needed
  useEffect(() => {
    if (userInteractions.length >= 5 && !behaviorAnalysis) {
      updateBehaviorAnalysis();
    }
  }, [userInteractions.length]);

  return {
    userInteractions,
    behaviorAnalysis,
    recommendations,
    trackInteraction,
    updateBehaviorAnalysis,
    generatePersonalizedRecommendations,
    getUserSegment,
    markRecommendationViewed,
    markRecommendationClicked
  };
}