import React, { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useKV } from '@github/spark/hooks';
import { UserProfile } from '@/types/membership';
import { AdaptiveColorLearningSystem } from './AdaptiveColorLearningSystem';

interface SmartThemeApplicatorProps {
  userId?: string;
  userProfile?: UserProfile;
  currentContext?: 'reading' | 'editing' | 'dashboard' | 'analysis';
  enableAdaptiveLearning?: boolean;
}

interface UserThemeContext {
  timeBasedThemes: {
    morning: string;    // 6-12
    afternoon: string;  // 12-18
    evening: string;    // 18-22
    night: string;      // 22-6
  };
  contextualThemes: {
    reading: string;
    editing: string;
    dashboard: string;
    analysis: string;
  };
  personalizedSettings: {
    fontSize: number;
    lineHeight: number;
    letterSpacing: number;
    contrastLevel: 'normal' | 'high' | 'maximum';
    reducedMotion: boolean;
    colorBlindnessSupport: boolean;
  };
  adaptivePreferences: {
    autoTimeSwitch: boolean;
    contextualSwitch: boolean;
    learningMode: boolean; // AI learns from user behavior
    accessibilityMode: boolean;
    adaptiveColorLearning: boolean; // New adaptive learning feature
  };
}

const defaultThemeContext: UserThemeContext = {
  timeBasedThemes: {
    morning: 'sabq-editorial',      // Light, fresh for morning reading
    afternoon: 'royal-gold',       // Elegant for professional hours
    evening: 'warm-earth',         // Warm, comfortable for evening
    night: 'midnight-professional' // Dark theme for night reading
  },
  contextualThemes: {
    reading: 'sabq-editorial',
    editing: 'royal-gold',
    dashboard: 'coral-sunset',
    analysis: 'warm-earth'
  },
  personalizedSettings: {
    fontSize: 16,
    lineHeight: 1.6,
    letterSpacing: 0,
    contrastLevel: 'normal',
    reducedMotion: false,
    colorBlindnessSupport: false
  },
  adaptivePreferences: {
    autoTimeSwitch: true,
    contextualSwitch: true,
    learningMode: true,
    accessibilityMode: false,
    adaptiveColorLearning: true // Enable adaptive learning by default
  }
};

export const SmartThemeApplicator: React.FC<SmartThemeApplicatorProps> = ({ 
  userId, 
  userProfile, 
  currentContext = 'dashboard',
  enableAdaptiveLearning = true
}) => {
  const { applyPreset, updateThemeSettings, themeSettings, currentTheme } = useTheme();
  const [showAdaptiveLearning, setShowAdaptiveLearning] = useState(false);
  
  // Store user's theme context
  const [userThemeContext, setUserThemeContext] = useKV<UserThemeContext>(
    `user-theme-context-${userId || 'guest'}`,
    defaultThemeContext
  );

  // Track user's theme usage for learning
  const [themeUsageHistory, setThemeUsageHistory] = useKV<Array<{
    timestamp: Date;
    themeId: string;
    context: string;
    duration: number;
    userInitiated: boolean;
  }>>(`theme-usage-history-${userId || 'guest'}`, []);

  // Get current hour for time-based theme switching
  const getCurrentTimeSlot = (): keyof UserThemeContext['timeBasedThemes'] => {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 18) return 'afternoon';
    if (hour >= 18 && hour < 22) return 'evening';
    return 'night';
  };

  // Smart theme selection based on context and preferences
  const getOptimalTheme = (): string => {
    const { timeBasedThemes, contextualThemes, adaptivePreferences } = userThemeContext;
    
    // Priority 1: User's contextual preference if enabled
    if (adaptivePreferences.contextualSwitch && contextualThemes[currentContext]) {
      return contextualThemes[currentContext];
    }
    
    // Priority 2: Time-based theme if enabled
    if (adaptivePreferences.autoTimeSwitch) {
      const timeSlot = getCurrentTimeSlot();
      return timeBasedThemes[timeSlot];
    }
    
    // Priority 3: User's interest-based theme from profile
    if (userProfile?.interests) {
      // Map user interests to suitable themes
      const interestThemeMap: { [key: string]: string } = {
        'تقنية': 'ocean-blue',
        'رياضة': 'mint-fresh',
        'أعمال': 'royal-gold',
        'محليات': 'sabq-editorial',
        'سياحة': 'warm-earth',
      };
      
      const primaryInterest = userProfile.interests[0];
      if (primaryInterest && interestThemeMap[primaryInterest]) {
        return interestThemeMap[primaryInterest];
      }
    }
    
    // Fallback: Default editorial theme
    return 'sabq-editorial';
  };

  // Apply accessibility enhancements based on user needs
  const applyAccessibilitySettings = () => {
    const { personalizedSettings } = userThemeContext;
    
    updateThemeSettings({
      fontScale: personalizedSettings.fontSize,
      lineHeightScale: personalizedSettings.lineHeight,
      letterSpacing: personalizedSettings.letterSpacing,
    });

    // Apply contrast adjustments
    if (personalizedSettings.contrastLevel !== 'normal') {
      const root = document.documentElement;
      
      if (personalizedSettings.contrastLevel === 'high') {
        root.style.setProperty('--foreground', 'oklch(0.05 0 0)');
        root.style.setProperty('--background', 'oklch(1 0 0)');
      } else if (personalizedSettings.contrastLevel === 'maximum') {
        root.style.setProperty('--foreground', 'oklch(0 0 0)');
        root.style.setProperty('--background', 'oklch(1 0 0)');
        root.style.setProperty('--primary', 'oklch(0.1 0 0)');
      }
    }

    // Apply reduced motion
    if (personalizedSettings.reducedMotion) {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
          scroll-behavior: auto !important;
        }
      `;
      document.head.appendChild(style);
    }

    // Apply color blindness support
    if (personalizedSettings.colorBlindnessSupport) {
      const root = document.documentElement;
      // Use patterns and symbols in addition to colors
      root.style.setProperty('--accessibility-mode', '1');
    }
  };

  // Learn from user behavior (simplified AI learning)
  const learnFromUserBehavior = () => {
    if (!userThemeContext.adaptivePreferences.learningMode) return;

    // Analyze recent usage patterns
    const recentUsage = themeUsageHistory.slice(-20); // Last 20 theme changes
    
    if (recentUsage.length < 5) return; // Need minimum data
    
    // Find patterns: most used theme per context
    const contextUsage: { [key: string]: { [theme: string]: number } } = {};
    
    recentUsage.forEach(usage => {
      if (!contextUsage[usage.context]) {
        contextUsage[usage.context] = {};
      }
      contextUsage[usage.context][usage.themeId] = 
        (contextUsage[usage.context][usage.themeId] || 0) + 1;
    });

    // Update contextual themes based on learned preferences
    const updatedContextualThemes = { ...userThemeContext.contextualThemes };
    let hasChanges = false;

    Object.keys(contextUsage).forEach(context => {
      const themes = contextUsage[context];
      const mostUsedTheme = Object.keys(themes).reduce((a, b) => 
        themes[a] > themes[b] ? a : b
      );
      
      if (updatedContextualThemes[context as keyof typeof updatedContextualThemes] !== mostUsedTheme) {
        updatedContextualThemes[context as keyof typeof updatedContextualThemes] = mostUsedTheme;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setUserThemeContext(prev => ({
        ...prev,
        contextualThemes: updatedContextualThemes
      }));
    }
  };

  // Record theme usage for learning
  const recordThemeUsage = (themeId: string, userInitiated: boolean = false) => {
    const newUsage = {
      timestamp: new Date(),
      themeId,
      context: currentContext,
      duration: 0, // Will be updated when theme changes
      userInitiated
    };

    setThemeUsageHistory(prev => {
      // Update duration of last usage if exists
      const updated = [...prev];
      if (updated.length > 0) {
        const lastUsage = updated[updated.length - 1];
        lastUsage.duration = Date.now() - new Date(lastUsage.timestamp).getTime();
      }
      
      // Add new usage and keep only last 100 records
      updated.push(newUsage);
      return updated.slice(-100);
    });
  };

  // Main effect: Apply smart theme selection
  useEffect(() => {
    const optimalTheme = getOptimalTheme();
    
    // Only apply if different from current theme
    if (themeSettings.activePreset !== optimalTheme) {
      applyPreset(optimalTheme);
      recordThemeUsage(optimalTheme, false); // Auto-applied
    }
    
    // Apply accessibility settings
    applyAccessibilitySettings();
    
    // Learn from behavior periodically
    const learningInterval = setInterval(learnFromUserBehavior, 30000); // Every 30 seconds
    
    return () => clearInterval(learningInterval);
  }, [currentContext, userThemeContext, userProfile]);

  // Auto-switch based on time (every minute)
  useEffect(() => {
    if (!userThemeContext.adaptivePreferences.autoTimeSwitch) return;

    const timeCheckInterval = setInterval(() => {
      const currentTimeSlot = getCurrentTimeSlot();
      const expectedTheme = userThemeContext.timeBasedThemes[currentTimeSlot];
      
      if (themeSettings.activePreset !== expectedTheme) {
        applyPreset(expectedTheme);
        recordThemeUsage(expectedTheme, false);
      }
    }, 60000); // Check every minute

    return () => clearInterval(timeCheckInterval);
  }, [userThemeContext.adaptivePreferences.autoTimeSwitch, userThemeContext.timeBasedThemes]);

  // Show adaptive learning when enabled and user is active
  const shouldShowAdaptiveLearning = 
    enableAdaptiveLearning && 
    userThemeContext.adaptivePreferences.adaptiveColorLearning &&
    userId &&
    (currentContext === 'reading' || currentContext === 'editing');

  // This component renders the adaptive learning system when appropriate
  return (
    <>
      {shouldShowAdaptiveLearning && (
        <div className="fixed bottom-4 right-4 z-40 max-w-sm">
          <AdaptiveColorLearningSystem
            userId={userId!}
            userProfile={userProfile}
            isActive={shouldShowAdaptiveLearning}
            onColorAdaptation={(adaptedColors, reason) => {
              console.log('Smart theme applicator - color adaptation:', { adaptedColors, reason });
              // Record this as a learning event
              recordThemeUsage('adaptive-colors', false);
            }}
          />
        </div>
      )}
    </>
  );
};

// Hook for easy theme context management
export const useSmartTheme = (userId?: string) => {
  const [userThemeContext, setUserThemeContext] = useKV<UserThemeContext>(
    `user-theme-context-${userId || 'guest'}`,
    defaultThemeContext
  );

  const updateTimeBasedTheme = (timeSlot: keyof UserThemeContext['timeBasedThemes'], themeId: string) => {
    setUserThemeContext(prev => ({
      ...prev,
      timeBasedThemes: {
        ...prev.timeBasedThemes,
        [timeSlot]: themeId
      }
    }));
  };

  const updateContextualTheme = (context: keyof UserThemeContext['contextualThemes'], themeId: string) => {
    setUserThemeContext(prev => ({
      ...prev,
      contextualThemes: {
        ...prev.contextualThemes,
        [context]: themeId
      }
    }));
  };

  const updatePersonalizedSettings = (settings: Partial<UserThemeContext['personalizedSettings']>) => {
    setUserThemeContext(prev => ({
      ...prev,
      personalizedSettings: {
        ...prev.personalizedSettings,
        ...settings
      }
    }));
  };

  const toggleAdaptivePreference = (preference: keyof UserThemeContext['adaptivePreferences']) => {
    setUserThemeContext(prev => ({
      ...prev,
      adaptivePreferences: {
        ...prev.adaptivePreferences,
        [preference]: !prev.adaptivePreferences[preference]
      }
    }));
  };

  return {
    userThemeContext,
    updateTimeBasedTheme,
    updateContextualTheme,
    updatePersonalizedSettings,
    toggleAdaptivePreference,
    setUserThemeContext
  };
};

export default SmartThemeApplicator;