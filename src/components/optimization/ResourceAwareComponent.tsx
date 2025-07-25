/**
 * Resource-aware component wrapper that automatically tracks usage patterns
 */

import React, { useEffect, useRef } from 'react';
import { useResourceOptimization } from '@/lib/autoResourceOptimizer';

interface ResourceAwareComponentProps {
  componentName: string;
  children: React.ReactNode;
  className?: string;
  trackMemory?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

export function ResourceAwareComponent({ 
  componentName, 
  children, 
  className,
  trackMemory = true,
  priority = 'medium'
}: ResourceAwareComponentProps) {
  const { trackUsage } = useResourceOptimization(componentName);
  const startTime = useRef<number>();
  const memoryBefore = useRef<number>();

  useEffect(() => {
    startTime.current = performance.now();
    
    if (trackMemory && typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      memoryBefore.current = memory.usedJSHeapSize;
    }

    return () => {
      if (startTime.current) {
        const renderTime = performance.now() - startTime.current;
        trackUsage(renderTime);
      }
    };
  }, [trackUsage]);

  return (
    <div className={className} data-component={componentName} data-priority={priority}>
      {children}
    </div>
  );
}

/**
 * Hook for components to self-report their performance metrics
 */
export function useComponentPerformanceTracking(componentName: string) {
  const { trackUsage } = useResourceOptimization(componentName);
  const renderCount = useRef(0);
  const totalRenderTime = useRef(0);

  const reportRenderTime = (renderTime: number) => {
    renderCount.current += 1;
    totalRenderTime.current += renderTime;
    trackUsage(renderTime);
  };

  const getAverageRenderTime = () => {
    return renderCount.current > 0 ? totalRenderTime.current / renderCount.current : 0;
  };

  return {
    reportRenderTime,
    getAverageRenderTime,
    renderCount: renderCount.current
  };
}

/**
 * Higher-order component to automatically wrap components with resource tracking
 */
export function withResourceTracking<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName?: string
) {
  const WrappedWithTracking = React.forwardRef<any, P>((props, ref) => {
    const name = componentName || WrappedComponent.displayName || WrappedComponent.name || 'UnknownComponent';
    
    return (
      <ResourceAwareComponent componentName={name}>
        <WrappedComponent {...props} ref={ref} />
      </ResourceAwareComponent>
    );
  });

  WrappedWithTracking.displayName = `withResourceTracking(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WrappedWithTracking;
}

/**
 * Performance monitoring component for critical app sections
 */
interface PerformanceMonitorProps {
  sectionName: string;
  children: React.ReactNode;
  warningThreshold?: number; // ms
  errorThreshold?: number; // ms
}

export function PerformanceMonitor({ 
  sectionName, 
  children, 
  warningThreshold = 100,
  errorThreshold = 500 
}: PerformanceMonitorProps) {
  const { trackUsage } = useResourceOptimization(`Monitor-${sectionName}`);
  const startTime = useRef<number>();
  const observer = useRef<PerformanceObserver>();

  useEffect(() => {
    startTime.current = performance.now();

    // Use Performance Observer API for more accurate measurements
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      observer.current = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name.includes(sectionName)) {
            const duration = entry.duration;
            trackUsage(duration);

            if (duration > errorThreshold) {
              console.error(`Performance: ${sectionName} took ${duration.toFixed(2)}ms (threshold: ${errorThreshold}ms)`);
            } else if (duration > warningThreshold) {
              console.warn(`Performance: ${sectionName} took ${duration.toFixed(2)}ms (threshold: ${warningThreshold}ms)`);
            }
          }
        }
      });

      observer.current.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    }

    return () => {
      if (startTime.current) {
        const totalTime = performance.now() - startTime.current;
        trackUsage(totalTime);
        
        // Mark the performance measurement
        if (typeof performance !== 'undefined' && performance.mark) {
          performance.mark(`${sectionName}-end`);
          performance.measure(`${sectionName}-total`, `${sectionName}-start`, `${sectionName}-end`);
        }
      }

      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [sectionName, trackUsage, warningThreshold, errorThreshold]);

  useEffect(() => {
    // Mark the start of performance measurement
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(`${sectionName}-start`);
    }
  }, [sectionName]);

  return <>{children}</>;
}

/**
 * Memory usage tracker for heavy components
 */
interface MemoryTrackerProps {
  componentName: string;
  children: React.ReactNode;
  memoryWarningThreshold?: number; // MB
}

export function MemoryTracker({ 
  componentName, 
  children, 
  memoryWarningThreshold = 50 
}: MemoryTrackerProps) {
  const initialMemory = useRef<number>();
  const { trackUsage } = useResourceOptimization(`Memory-${componentName}`);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      initialMemory.current = memory.usedJSHeapSize;
    }

    return () => {
      if (typeof window !== 'undefined' && 'memory' in performance && initialMemory.current) {
        const memory = (performance as any).memory;
        const memoryDiff = (memory.usedJSHeapSize - initialMemory.current) / 1048576; // MB
        
        trackUsage(Math.abs(memoryDiff));

        if (memoryDiff > memoryWarningThreshold) {
          console.warn(`Memory: ${componentName} increased memory usage by ${memoryDiff.toFixed(2)}MB`);
        }
      }
    };
  }, [componentName, trackUsage, memoryWarningThreshold]);

  return <>{children}</>;
}

/**
 * Lazy loading wrapper with resource tracking
 */
interface LazyResourceWrapperProps {
  componentName: string;
  loadComponent: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ComponentNode;
  props?: any;
}

export function LazyResourceWrapper({ 
  componentName, 
  loadComponent, 
  fallback = <div>Loading...</div>,
  props = {}
}: LazyResourceWrapperProps) {
  const LazyComponent = React.lazy(loadComponent);
  const { trackUsage } = useResourceOptimization(`Lazy-${componentName}`);
  const loadStartTime = useRef<number>();

  useEffect(() => {
    loadStartTime.current = performance.now();
  }, []);

  const handleComponentLoad = () => {
    if (loadStartTime.current) {
      const loadTime = performance.now() - loadStartTime.current;
      trackUsage(loadTime);
    }
  };

  return (
    <React.Suspense fallback={fallback}>
      <LazyComponent {...props} onLoad={handleComponentLoad} />
    </React.Suspense>
  );
}

export default ResourceAwareComponent;