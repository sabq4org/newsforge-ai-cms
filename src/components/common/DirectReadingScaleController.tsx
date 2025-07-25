import React, { useEffect, useState } from 'react';
import { useKV } from '@github/spark/hooks';

interface ReadingScaleControllerProps {
  userId?: string;
  defaultScale?: number;
  autoAdjust?: boolean;
}

/**
 * DirectReadingScaleController - Real-time reading scale adjustment system
 */
export function DirectReadingScaleController({ 
  userId = 'guest', 
  defaultScale = 1,
  autoAdjust = true 
}: ReadingScaleControllerProps) {
  const [readingScale, setReadingScale] = useKV(`reading-scale-${userId}`, defaultScale);
  const [autoScaleEnabled, setAutoScaleEnabled] = useKV(`auto-scale-${userId}`, autoAdjust);
  const [currentContext, setCurrentContext] = useState<'reading' | 'writing' | 'browsing'>('browsing');

  // Apply reading scale to CSS custom properties
  useEffect(() => {
    document.documentElement.style.setProperty('--reading-scale-current', readingScale.toString());
    
    // Apply scale to content areas
    const contentAreas = document.querySelectorAll(
      '.article-content, .editor-content, .reading-area, .text-content'
    );
    
    contentAreas.forEach(area => {
      (area as HTMLElement).classList.add('reading-scale-active');
    });
  }, [readingScale]);

  // Auto-adjust based on context and time
  useEffect(() => {
    if (!autoScaleEnabled) return;

    const detectContext = () => {
      const activeElement = document.activeElement;
      const isEditing = activeElement?.tagName === 'TEXTAREA' || 
                       activeElement?.tagName === 'INPUT' || 
                       activeElement?.hasAttribute('contenteditable');
      
      const isReading = document.querySelector('.article-view, .reading-mode') !== null;
      
      if (isEditing) {
        setCurrentContext('writing');
      } else if (isReading) {
        setCurrentContext('reading');
      } else {
        setCurrentContext('browsing');
      }
    };

    // Detect context changes
    const observer = new MutationObserver(detectContext);
    observer.observe(document.body, { 
      childList: true, 
      subtree: true, 
      attributes: true,
      attributeFilter: ['class'] 
    });

    // Focus/blur detection
    document.addEventListener('focusin', detectContext);
    document.addEventListener('focusout', detectContext);

    // Time-based adjustments
    const adjustByTime = () => {
      const hour = new Date().getHours();
      let timeMultiplier = 1;

      // Morning adjustment (6-10 AM)
      if (hour >= 6 && hour < 10) {
        timeMultiplier = 1.05; // Slightly larger for morning reading
      }
      // Evening adjustment (6-9 PM)  
      else if (hour >= 18 && hour < 21) {
        timeMultiplier = 1.1; // Larger for evening comfort
      }
      // Night adjustment (9 PM - 12 AM)
      else if (hour >= 21 || hour < 6) {
        timeMultiplier = 1.15; // Largest for night reading
      }

      if (Math.abs(readingScale - (defaultScale * timeMultiplier)) > 0.05) {
        setReadingScale(defaultScale * timeMultiplier);
      }
    };

    // Check time adjustment every 30 minutes
    const timeInterval = setInterval(adjustByTime, 30 * 60 * 1000);
    adjustByTime(); // Run once on mount

    return () => {
      observer.disconnect();
      document.removeEventListener('focusin', detectContext);
      document.removeEventListener('focusout', detectContext);
      clearInterval(timeInterval);
    };
  }, [autoScaleEnabled, defaultScale, readingScale, setReadingScale]);

  // Context-based scale adjustments
  useEffect(() => {
    if (!autoScaleEnabled) return;

    let contextScale = defaultScale;
    
    switch (currentContext) {
      case 'reading':
        contextScale = defaultScale * 1.1; // 10% larger for reading
        break;
      case 'writing':
        contextScale = defaultScale * 1.05; // 5% larger for writing
        break;
      case 'browsing':
        contextScale = defaultScale; // Default size for browsing
        break;
    }

    if (Math.abs(readingScale - contextScale) > 0.02) {
      setReadingScale(contextScale);
    }
  }, [currentContext, autoScaleEnabled, defaultScale, readingScale, setReadingScale]);

  return null; // This component doesn't render anything visual
}

/**
 * ReadingScaleIndicator - Visual indicator of current reading scale
 */
export function ReadingScaleIndicator({ userId = 'guest' }: { userId?: string }) {
  const [readingScale] = useKV(`reading-scale-${userId}`, 1);
  const [autoScaleEnabled] = useKV(`auto-scale-${userId}`, true);
  
  const scalePercentage = Math.round(readingScale * 100);
  
  return (
    <div className="fixed bottom-4 left-4 z-40 bg-card border border-border rounded-md px-3 py-2 text-sm shadow-md">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">مقياس القراءة:</span>
        <span className="font-medium">{scalePercentage}%</span>
        {autoScaleEnabled && (
          <span className="text-xs text-accent">تلقائي</span>
        )}
      </div>
    </div>
  );
}

export default DirectReadingScaleController;