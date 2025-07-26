import React, { useEffect, useState, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';
import {
  validateColorProfile,
  validateEnvironmentalContext,
  createDefaultColorProfile,
  createDefaultEnvironmentalContext,
  safelyApplyCSSVariables,
  safelyApplyClasses,
  safeSessionStorage,
  safelyDetectTimeOfDay,
  safelyDetectActivity,
  withQuantumColorSafety,
  type SafeColorProfile,
  type SafeEnvironmentalContext
} from '@/lib/quantumColorSafety';

interface QuantumColorAdaptationSystemProps {
  userId?: string;
  enableLearning?: boolean;
  adaptationSpeed?: number;
}

// Use the safe types from the safety module
type ColorProfile = SafeColorProfile;
type EnvironmentalContext = SafeEnvironmentalContext;

/**
 * QuantumColorAdaptationSystem - Advanced AI-powered color adaptation
 */
export function QuantumColorAdaptationSystem({ 
  userId = 'guest', 
  enableLearning = true,
  adaptationSpeed = 0.3 
}: QuantumColorAdaptationSystemProps) {
  try {
    const [colorProfile, setColorProfile] = useKV<ColorProfile>(`color-profile-${userId}`, createDefaultColorProfile());

    const [environmentalContext, setEnvironmentalContext] = useState<EnvironmentalContext>(createDefaultEnvironmentalContext());

    const [adaptationHistory, setAdaptationHistory] = useKV<ColorProfile[]>(
      `adaptation-history-${userId}`, 
      []
    );

  // Detect environmental context
  const detectEnvironmentalContext = useCallback(withQuantumColorSafety(() => {
    const timeOfDay = safelyDetectTimeOfDay();
    const activity = safelyDetectActivity();

    // Simple eye strain detection based on session length and activity
    let sessionLength = 0;
    const sessionStorage = safeSessionStorage();
    const sessionStart = sessionStorage.getItem('session-start');
    if (sessionStart) {
      sessionLength = (Date.now() - parseInt(sessionStart)) / (1000 * 60);
    }
    
    let eyeStrain: EnvironmentalContext['eyeStrain'] = 'low';
    if (sessionLength > 30) eyeStrain = 'medium';
    if (sessionLength > 60) eyeStrain = 'high';

    const newContext: EnvironmentalContext = {
      timeOfDay,
      activity,
      eyeStrain,
      sessionLength
    };

    setEnvironmentalContext(validateEnvironmentalContext(newContext));
  }, 'Environmental context detection failed'), []);

  // Apply color adaptations to CSS
  const applyColorAdaptations = useCallback(withQuantumColorSafety((profile: ColorProfile) => {
    const validatedProfile = validateColorProfile(profile);
    const validatedContext = validateEnvironmentalContext(environmentalContext);
    
    // Apply CSS variables safely
    safelyApplyCSSVariables({
      '--quantum-color-red': validatedProfile.red,
      '--quantum-color-green': validatedProfile.green,
      '--quantum-color-blue': validatedProfile.blue,
      '--adaptive-color-warmth': validatedProfile.warmth,
      '--adaptive-color-contrast': validatedProfile.contrast,
      '--adaptive-color-intensity': validatedProfile.intensity,
      '--quantum-adaptation-speed': `${adaptationSpeed}s`
    });

    // Apply context-specific classes safely
    const timeOfDayClasses = ['context-morning', 'context-afternoon', 'context-evening', 'context-night'];
    safelyApplyClasses('body', [`context-${validatedContext.timeOfDay}`], timeOfDayClasses);

    // Apply adaptive colors to main content areas safely
    const contentSelectors = [
      '.main-content',
      '.article-content', 
      '.editor-content',
      '.dashboard',
      '.analytics-content'
    ];
    
    contentSelectors.forEach(selector => {
      safelyApplyClasses(selector, ['adaptive-colors']);
    });
  }, 'Color adaptation application failed'), [adaptationSpeed, environmentalContext]);

  // Quantum learning algorithm - learns from user behavior patterns
  const quantumColorLearning = useCallback(withQuantumColorSafety(async () => {
    if (!enableLearning) return;

    // Safety check and validation
    const safeContext = validateEnvironmentalContext(environmentalContext);
    const safeProfile = validateColorProfile(colorProfile);

    const prompt = spark.llmPrompt`
      Analyze user's reading context and optimize colors for comfort:
      
      Time: ${safeContext.timeOfDay}
      Activity: ${safeContext.activity}
      Eye Strain Level: ${safeContext.eyeStrain}
      Session Length: ${safeContext.sessionLength} minutes
      
      Current Color Profile:
      - Red offset: ${safeProfile.red}
      - Green offset: ${safeProfile.green}  
      - Blue offset: ${safeProfile.blue}
      - Warmth: ${safeProfile.warmth}
      - Contrast: ${safeProfile.contrast}
      - Intensity: ${safeProfile.intensity}
      
      Provide optimized color adjustments as JSON:
      {
        "red": number (-10 to 10),
        "green": number (-10 to 10),
        "blue": number (-10 to 10),
        "warmth": number (-0.3 to 0.3),
        "contrast": number (0.7 to 1.3),
        "intensity": number (0.5 to 1.2),
        "reasoning": "brief explanation"
      }
    `;

    const response = await spark.llm(prompt, 'gpt-4o-mini', true);
    
    if (!response) {
      console.warn('Empty response from quantum learning AI');
      return;
    }

    let optimization;
    try {
      optimization = JSON.parse(response);
    } catch (parseError) {
      console.warn('Failed to parse quantum learning response:', parseError);
      return;
    }

    // Validate optimization response and apply gradual adaptation
    const newProfile: ColorProfile = {
      red: Math.max(-10, Math.min(10, safeProfile.red + ((optimization.red || 0) - safeProfile.red) * 0.3)),
      green: Math.max(-10, Math.min(10, safeProfile.green + ((optimization.green || 0) - safeProfile.green) * 0.3)),
      blue: Math.max(-10, Math.min(10, safeProfile.blue + ((optimization.blue || 0) - safeProfile.blue) * 0.3)),
      warmth: Math.max(-0.3, Math.min(0.3, safeProfile.warmth + ((optimization.warmth || 0) - safeProfile.warmth) * 0.3)),
      contrast: Math.max(0.7, Math.min(1.3, safeProfile.contrast + ((optimization.contrast || 1) - safeProfile.contrast) * 0.3)),
      intensity: Math.max(0.5, Math.min(1.2, safeProfile.intensity + ((optimization.intensity || 1) - safeProfile.intensity) * 0.3)),
      timestamp: Date.now()
    };

    const validatedNewProfile = validateColorProfile(newProfile);
    setColorProfile(validatedNewProfile);
    
    // Store in adaptation history safely
    if (typeof setAdaptationHistory === 'function') {
      setAdaptationHistory(prev => {
        const safePrev = Array.isArray(prev) ? prev : [];
        const newHistory = [...safePrev, validatedNewProfile].slice(-50);
        return newHistory;
      });
    }

    console.log('Quantum color adaptation applied:', optimization.reasoning || 'Applied successfully');
  }, 'Quantum color learning failed'), [enableLearning, environmentalContext, colorProfile, setColorProfile, setAdaptationHistory]);

  // Initialize session tracking
  useEffect(() => {
    const sessionStorage = safeSessionStorage();
    if (!sessionStorage.getItem('session-start')) {
      sessionStorage.setItem('session-start', Date.now().toString());
    }
  }, []);

  // Monitor environmental changes
  useEffect(() => {
    try {
      detectEnvironmentalContext();
      
      const interval = setInterval(() => {
        try {
          detectEnvironmentalContext();
        } catch (contextError) {
          console.warn('Error in periodic context detection:', contextError);
        }
      }, 60000); // Check every minute
      
      const focusHandler = () => {
        try {
          detectEnvironmentalContext();
        } catch (focusError) {
          console.warn('Error in focus context detection:', focusError);
        }
      };
      
      if (typeof window !== 'undefined' && window.addEventListener) {
        window.addEventListener('focus', focusHandler);
      }
      
      if (typeof document !== 'undefined' && document.addEventListener) {
        document.addEventListener('visibilitychange', focusHandler);
      }
      
      return () => {
        try {
          clearInterval(interval);
          if (typeof window !== 'undefined' && window.removeEventListener) {
            window.removeEventListener('focus', focusHandler);
          }
          if (typeof document !== 'undefined' && document.removeEventListener) {
            document.removeEventListener('visibilitychange', focusHandler);
          }
        } catch (cleanupError) {
          console.warn('Error in cleanup:', cleanupError);
        }
      };
    } catch (error) {
      console.warn('Error in environmental monitoring setup:', error);
    }
  }, [detectEnvironmentalContext]);

  // Apply color adaptations
  useEffect(() => {
    const safeProfile = validateColorProfile(colorProfile);
    if (applyColorAdaptations) {
      applyColorAdaptations(safeProfile);
    }
  }, [colorProfile, applyColorAdaptations]);

  // Run quantum learning periodically
  useEffect(() => {
    if (!enableLearning) return;

    try {
      // Initial learning after 30 seconds
      const initialTimeout = setTimeout(() => {
        try {
          quantumColorLearning();
        } catch (learningError) {
          console.warn('Error in initial quantum learning:', learningError);
        }
      }, 30000);
      
      // Then every 10 minutes
      const interval = setInterval(() => {
        try {
          quantumColorLearning();
        } catch (intervalError) {
          console.warn('Error in periodic quantum learning:', intervalError);
        }
      }, 10 * 60 * 1000);
      
      return () => {
        try {
          clearTimeout(initialTimeout);
          clearInterval(interval);
        } catch (cleanupError) {
          console.warn('Error in quantum learning cleanup:', cleanupError);
        }
      };
    } catch (error) {
      console.warn('Error in quantum learning setup:', error);
    }
  }, [enableLearning, quantumColorLearning]);

  return null; // This component doesn't render anything visual
  } catch (error) {
    console.error('Critical error in QuantumColorAdaptationSystem:', error);
    return null; // Fail gracefully without crashing the app
  }
}

/**
 * ColorAdaptationIndicator - Shows current color adaptation status
 */
export function ColorAdaptationIndicator({ userId = 'guest' }: { userId?: string }) {
  try {
    const [colorProfile] = useKV<ColorProfile>(`color-profile-${userId}`, createDefaultColorProfile());

    const safeProfile = validateColorProfile(colorProfile);

    const hasAdaptations = safeProfile.red !== 0 || 
                          safeProfile.green !== 0 || 
                          safeProfile.blue !== 0 || 
                          safeProfile.warmth !== 0 ||
                          safeProfile.contrast !== 1 ||
                          safeProfile.intensity !== 1;

    if (!hasAdaptations) return null;

    return (
      <div className="fixed bottom-4 right-4 z-40 bg-card border border-border rounded-md px-3 py-2 text-sm shadow-md">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gradient-to-r from-accent to-primary animate-pulse"></div>
          <span className="text-muted-foreground">تكيف ألوان ذكي</span>
          <span className="text-xs text-accent">نشط</span>
        </div>
      </div>
    );
  } catch (error) {
    console.warn('Error in ColorAdaptationIndicator:', error);
    return null;
  }
}

export default QuantumColorAdaptationSystem;