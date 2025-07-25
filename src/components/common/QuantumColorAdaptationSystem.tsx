import React, { useEffect, useState, useCallback } from 'react';
import { useKV } from '@github/spark/hooks';

interface QuantumColorAdaptationSystemProps {
  userId?: string;
  enableLearning?: boolean;
  adaptationSpeed?: number;
}

interface ColorProfile {
  red: number;
  green: number;
  blue: number;
  warmth: number;
  contrast: number;
  intensity: number;
  timestamp: number;
}

interface EnvironmentalContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  activity: 'reading' | 'writing' | 'browsing' | 'analytics';
  eyeStrain: 'low' | 'medium' | 'high';
  sessionLength: number; // in minutes
}

/**
 * QuantumColorAdaptationSystem - Advanced AI-powered color adaptation
 */
export function QuantumColorAdaptationSystem({ 
  userId = 'guest', 
  enableLearning = true,
  adaptationSpeed = 0.3 
}: QuantumColorAdaptationSystemProps) {
  const [colorProfile, setColorProfile] = useKV<ColorProfile>(`color-profile-${userId}`, {
    red: 0,
    green: 0,
    blue: 0,
    warmth: 0,
    contrast: 1,
    intensity: 1,
    timestamp: Date.now()
  });

  const [environmentalContext, setEnvironmentalContext] = useState<EnvironmentalContext>({
    timeOfDay: 'morning',
    activity: 'browsing',
    eyeStrain: 'low',
    sessionLength: 0
  });

  const [adaptationHistory, setAdaptationHistory] = useKV<ColorProfile[]>(
    `adaptation-history-${userId}`, 
    []
  );

  // Detect environmental context
  const detectEnvironmentalContext = useCallback(() => {
    const hour = new Date().getHours();
    let timeOfDay: EnvironmentalContext['timeOfDay'];
    
    if (hour >= 6 && hour < 12) timeOfDay = 'morning';
    else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
    else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
    else timeOfDay = 'night';

    // Detect activity
    const url = window.location.pathname;
    const activeElement = document.activeElement;
    let activity: EnvironmentalContext['activity'] = 'browsing';
    
    if (url.includes('editor') || activeElement?.tagName === 'TEXTAREA' || 
        activeElement?.hasAttribute('contenteditable')) {
      activity = 'writing';
    } else if (url.includes('analytics') || url.includes('dashboard')) {
      activity = 'analytics';
    } else if (document.querySelector('.article-view, .reading-mode')) {
      activity = 'reading';
    }

    // Simple eye strain detection based on session length and activity
    const sessionStart = sessionStorage.getItem('session-start');
    const sessionLength = sessionStart 
      ? (Date.now() - parseInt(sessionStart)) / (1000 * 60) 
      : 0;
    
    let eyeStrain: EnvironmentalContext['eyeStrain'] = 'low';
    if (sessionLength > 30) eyeStrain = 'medium';
    if (sessionLength > 60) eyeStrain = 'high';

    setEnvironmentalContext({
      timeOfDay,
      activity,
      eyeStrain,
      sessionLength
    });
  }, []);

  // Apply color adaptations to CSS
  const applyColorAdaptations = useCallback((profile: ColorProfile) => {
    const root = document.documentElement;
    
    root.style.setProperty('--quantum-color-red', profile.red.toString());
    root.style.setProperty('--quantum-color-green', profile.green.toString());
    root.style.setProperty('--quantum-color-blue', profile.blue.toString());
    root.style.setProperty('--adaptive-color-warmth', profile.warmth.toString());
    root.style.setProperty('--adaptive-color-contrast', profile.contrast.toString());
    root.style.setProperty('--adaptive-color-intensity', profile.intensity.toString());
    root.style.setProperty('--quantum-adaptation-speed', `${adaptationSpeed}s`);

    // Apply context-specific classes
    document.body.classList.remove('context-morning', 'context-afternoon', 'context-evening', 'context-night');
    document.body.classList.add(`context-${environmentalContext.timeOfDay}`);

    // Apply adaptive colors to main content areas
    const contentAreas = document.querySelectorAll(
      '.main-content, .article-content, .editor-content, .dashboard, .analytics-content'
    );
    
    contentAreas.forEach(area => {
      (area as HTMLElement).classList.add('adaptive-colors');
    });
  }, [adaptationSpeed, environmentalContext.timeOfDay]);

  // Quantum learning algorithm - learns from user behavior patterns
  const quantumColorLearning = useCallback(async () => {
    if (!enableLearning) return;

    try {
      // Create AI prompt for color optimization
      const prompt = spark.llmPrompt`
        Analyze user's reading context and optimize colors for comfort:
        
        Time: ${environmentalContext.timeOfDay}
        Activity: ${environmentalContext.activity}
        Eye Strain Level: ${environmentalContext.eyeStrain}
        Session Length: ${environmentalContext.sessionLength} minutes
        
        Current Color Profile:
        - Red offset: ${colorProfile.red}
        - Green offset: ${colorProfile.green}  
        - Blue offset: ${colorProfile.blue}
        - Warmth: ${colorProfile.warmth}
        - Contrast: ${colorProfile.contrast}
        - Intensity: ${colorProfile.intensity}
        
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
      const optimization = JSON.parse(response);
      
      // Apply gradual adaptation (not instant change)
      const newProfile: ColorProfile = {
        red: Math.max(-10, Math.min(10, colorProfile.red + (optimization.red - colorProfile.red) * 0.3)),
        green: Math.max(-10, Math.min(10, colorProfile.green + (optimization.green - colorProfile.green) * 0.3)),
        blue: Math.max(-10, Math.min(10, colorProfile.blue + (optimization.blue - colorProfile.blue) * 0.3)),
        warmth: Math.max(-0.3, Math.min(0.3, colorProfile.warmth + (optimization.warmth - colorProfile.warmth) * 0.3)),
        contrast: Math.max(0.7, Math.min(1.3, colorProfile.contrast + (optimization.contrast - colorProfile.contrast) * 0.3)),
        intensity: Math.max(0.5, Math.min(1.2, colorProfile.intensity + (optimization.intensity - colorProfile.intensity) * 0.3)),
        timestamp: Date.now()
      };

      setColorProfile(newProfile);
      
      // Store in adaptation history
      setAdaptationHistory(prev => {
        const newHistory = [...prev, newProfile].slice(-50); // Keep last 50 adaptations
        return newHistory;
      });

      console.log('Quantum color adaptation applied:', optimization.reasoning);
    } catch (error) {
      console.warn('Quantum color learning failed:', error);
    }
  }, [enableLearning, environmentalContext, colorProfile, setColorProfile, setAdaptationHistory]);

  // Initialize session tracking
  useEffect(() => {
    if (!sessionStorage.getItem('session-start')) {
      sessionStorage.setItem('session-start', Date.now().toString());
    }
  }, []);

  // Monitor environmental changes
  useEffect(() => {
    detectEnvironmentalContext();
    
    const interval = setInterval(detectEnvironmentalContext, 60000); // Check every minute
    const focusHandler = () => detectEnvironmentalContext();
    
    window.addEventListener('focus', focusHandler);
    document.addEventListener('visibilitychange', focusHandler);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', focusHandler);
      document.removeEventListener('visibilitychange', focusHandler);
    };
  }, [detectEnvironmentalContext]);

  // Apply color adaptations
  useEffect(() => {
    applyColorAdaptations(colorProfile);
  }, [colorProfile, applyColorAdaptations]);

  // Run quantum learning periodically
  useEffect(() => {
    if (!enableLearning) return;

    // Initial learning after 30 seconds
    const initialTimeout = setTimeout(quantumColorLearning, 30000);
    
    // Then every 10 minutes
    const interval = setInterval(quantumColorLearning, 10 * 60 * 1000);
    
    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, [enableLearning, quantumColorLearning]);

  return null; // This component doesn't render anything visual
}

/**
 * ColorAdaptationIndicator - Shows current color adaptation status
 */
export function ColorAdaptationIndicator({ userId = 'guest' }: { userId?: string }) {
  const [colorProfile] = useKV<ColorProfile>(`color-profile-${userId}`, {
    red: 0, green: 0, blue: 0, warmth: 0, contrast: 1, intensity: 1, timestamp: Date.now()
  });

  const hasAdaptations = colorProfile.red !== 0 || 
                        colorProfile.green !== 0 || 
                        colorProfile.blue !== 0 || 
                        colorProfile.warmth !== 0 ||
                        colorProfile.contrast !== 1 ||
                        colorProfile.intensity !== 1;

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
}

export default QuantumColorAdaptationSystem;