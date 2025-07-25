/**
 * Performance optimization utilities for memory management and component optimization
 */

import React, { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Memory management utilities
export class MemoryManager {
  private static instance: MemoryManager;
  private observers: WeakMap<object, () => void> = new WeakMap();
  private timers: Set<NodeJS.Timeout> = new Set();
  private intervals: Set<NodeJS.Timeout> = new Set();

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // Register cleanup function for component
  registerCleanup(component: object, cleanup: () => void): void {
    this.observers.set(component, cleanup);
  }

  // Cleanup component resources
  cleanup(component: object): void {
    const cleanup = this.observers.get(component);
    if (cleanup) {
      cleanup();
      this.observers.delete(component);
    }
  }

  // Safe timer management
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const timer = setTimeout(() => {
      callback();
      this.timers.delete(timer);
    }, delay);
    this.timers.add(timer);
    return timer;
  }

  setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const interval = setInterval(callback, delay);
    this.intervals.add(interval);
    return interval;
  }

  clearTimeout(timer: NodeJS.Timeout): void {
    clearTimeout(timer);
    this.timers.delete(timer);
  }

  clearInterval(interval: NodeJS.Timeout): void {
    clearInterval(interval);
    this.intervals.delete(interval);
  }

  // Clear all timers
  clearAllTimers(): void {
    this.timers.forEach(timer => clearTimeout(timer));
    this.intervals.forEach(interval => clearInterval(interval));
    this.timers.clear();
    this.intervals.clear();
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();

  static startMeasurement(name: string): number {
    return performance.now();
  }

  static endMeasurement(name: string, startTime: number): number {
    const duration = performance.now() - startTime;
    const measurements = this.measurements.get(name) || [];
    measurements.push(duration);
    
    // Keep only last 100 measurements per metric
    if (measurements.length > 100) {
      measurements.shift();
    }
    
    this.measurements.set(name, measurements);
    return duration;
  }

  static getAverageTime(name: string): number {
    const measurements = this.measurements.get(name);
    if (!measurements || measurements.length === 0) return 0;
    
    return measurements.reduce((sum, time) => sum + time, 0) / measurements.length;
  }

  static getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const metrics: Record<string, { average: number; count: number; latest: number }> = {};
    
    this.measurements.forEach((times, name) => {
      metrics[name] = {
        average: this.getAverageTime(name),
        count: times.length,
        latest: times[times.length - 1] || 0
      };
    });
    
    return metrics;
  }
}

// Custom hooks for performance optimization
export function usePerformanceMonitor(componentName: string) {
  const startTime = useRef<number>();

  useEffect(() => {
    startTime.current = PerformanceMonitor.startMeasurement(`${componentName}-render`);
    
    return () => {
      if (startTime.current) {
        PerformanceMonitor.endMeasurement(`${componentName}-render`, startTime.current);
      }
    };
  });
}

export function useMemoryCleanup(cleanup: () => void) {
  const componentRef = useRef({});
  const memoryManager = MemoryManager.getInstance();

  useEffect(() => {
    memoryManager.registerCleanup(componentRef.current, cleanup);
    
    return () => {
      memoryManager.cleanup(componentRef.current);
    };
  }, [cleanup, memoryManager]);
}

// Debounced callback hook
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        MemoryManager.getInstance().clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      MemoryManager.getInstance().clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = MemoryManager.getInstance().setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]) as T;
}

// Memoized value with dependency tracking
export function useStableMemo<T>(factory: () => T, deps: React.DependencyList): T {
  const previousDeps = useRef<React.DependencyList>();
  const memoizedValue = useRef<T>();

  const depsChanged = useMemo(() => {
    if (!previousDeps.current) return true;
    if (previousDeps.current.length !== deps.length) return true;
    
    return deps.some((dep, index) => 
      !Object.is(dep, previousDeps.current![index])
    );
  }, deps);

  if (depsChanged) {
    memoizedValue.current = factory();
    previousDeps.current = deps;
  }

  return memoizedValue.current!;
}

// Virtual scrolling utilities
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return { start, end };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      top: (visibleRange.start + index) * itemHeight
    }));
  }, [items, visibleRange, itemHeight]);

  const totalHeight = items.length * itemHeight;

  return {
    visibleItems,
    totalHeight,
    setScrollTop,
    visibleRange
  };
}

// Data normalization and caching
export class DataCache {
  private static cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();

  static set<T>(key: string, data: T, ttlMs: number = 300000): void { // 5 minutes default TTL
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlMs
    });
  }

  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data as T;
  }

  static invalidate(key: string): void {
    this.cache.delete(key);
  }

  static clear(): void {
    this.cache.clear();
  }

  static getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Component lazy loading utility
export function createLazyComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback: React.ComponentType = () => React.createElement('div', null, 'Loading...')
) {
  const LazyComponent = React.lazy(importFunc);
  
  return React.forwardRef<any, React.ComponentProps<T>>((props, ref) => 
    React.createElement(
      React.Suspense,
      { fallback: React.createElement(fallback) },
      React.createElement(LazyComponent, { ...props, ref })
    )
  );
}

// Image optimization utilities
export function getOptimizedImageUrl(url: string, width?: number, height?: number, quality: number = 80): string {
  if (!url) return '';
  
  // Add image optimization parameters if supported
  const urlObj = new URL(url, window.location.origin);
  
  if (width) urlObj.searchParams.set('w', width.toString());
  if (height) urlObj.searchParams.set('h', height.toString());
  urlObj.searchParams.set('q', quality.toString());
  urlObj.searchParams.set('f', 'auto'); // Auto format selection
  
  return urlObj.toString();
}

// Bundle size analyzer
export function analyzeBundleSize(): void {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    
    console.group('Bundle Analysis');
    console.log('Page Load Time:', navigation.loadEventEnd - navigation.fetchStart, 'ms');
    console.log('DOM Content Loaded:', navigation.domContentLoadedEventEnd - navigation.fetchStart, 'ms');
    
    const jsResources = resources.filter(r => r.name.endsWith('.js'));
    const cssResources = resources.filter(r => r.name.endsWith('.css'));
    
    console.log('JavaScript bundles:', jsResources.length);
    console.log('CSS files:', cssResources.length);
    
    const totalJsSize = jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    const totalCssSize = cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0);
    
    console.log('Total JS size:', (totalJsSize / 1024).toFixed(2), 'KB');
    console.log('Total CSS size:', (totalCssSize / 1024).toFixed(2), 'KB');
    console.groupEnd();
  }
}

// Initialize performance monitoring
export function initializePerformanceOptimizer(): void {
  // Monitor memory usage
  if (typeof window !== 'undefined') {
    const memoryMonitor = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        console.log('Memory Usage:', {
          used: Math.round(memory.usedJSHeapSize / 1048576) + ' MB',
          total: Math.round(memory.totalJSHeapSize / 1048576) + ' MB',
          limit: Math.round(memory.jsHeapSizeLimit / 1048576) + ' MB'
        });
      }
    };

    // Monitor every 30 seconds in development
    if (process.env.NODE_ENV === 'development') {
      MemoryManager.getInstance().setInterval(memoryMonitor, 30000);
    }

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      MemoryManager.getInstance().clearAllTimers();
      DataCache.clear();
    });
  }

  console.log('Performance optimizer initialized');
}