/**
 * Automatic Resource Optimization System for Sabq AI CMS
 * Monitors usage patterns and automatically optimizes memory and resource allocation
 */

import { useKV } from '@github/spark/hooks';

// Usage pattern tracking interfaces
interface UsagePattern {
  componentName: string;
  frequency: number;
  memoryUsage: number;
  renderTime: number;
  priority: 'high' | 'medium' | 'low';
  lastAccessed: number;
  accessCount: number;
}

interface ResourceMetrics {
  memoryUsage: number;
  cpuUsage: number;
  renderCount: number;
  errorCount: number;
  loadTime: number;
  timestamp: number;
}

interface OptimizationRule {
  id: string;
  name: string;
  condition: (metrics: ResourceMetrics, patterns: UsagePattern[]) => boolean;
  action: (metrics: ResourceMetrics, patterns: UsagePattern[]) => OptimizationAction;
  priority: number;
}

interface OptimizationAction {
  type: 'memory_cleanup' | 'cache_clear' | 'lazy_load' | 'preload' | 'gc_suggestion';
  target?: string;
  reason: string;
  impact: 'high' | 'medium' | 'low';
}

// Main Auto Resource Optimizer class
export class AutoResourceOptimizer {
  private static instance: AutoResourceOptimizer;
  private patterns: Map<string, UsagePattern> = new Map();
  private metrics: ResourceMetrics[] = [];
  private optimizationRules: OptimizationRule[] = [];
  private isActive: boolean = true;
  private monitoringInterval?: NodeJS.Timeout;
  private optimizationInterval?: NodeJS.Timeout;

  static getInstance(): AutoResourceOptimizer {
    if (!AutoResourceOptimizer.instance) {
      AutoResourceOptimizer.instance = new AutoResourceOptimizer();
    }
    return AutoResourceOptimizer.instance;
  }

  constructor() {
    this.initializeOptimizationRules();
    this.startMonitoring();
  }

  // Initialize default optimization rules
  private initializeOptimizationRules(): void {
    this.optimizationRules = [
      {
        id: 'high_memory_usage',
        name: 'تنظيف الذاكرة عند الاستخدام العالي',
        condition: (metrics) => metrics.memoryUsage > 100, // MB
        action: () => ({
          type: 'memory_cleanup',
          reason: 'استخدام الذاكرة مرتفع',
          impact: 'high'
        }),
        priority: 1
      },
      {
        id: 'unused_components',
        name: 'تنظيف المكونات غير المستخدمة',
        condition: (_, patterns) => {
          const unusedComponents = patterns.filter(p => 
            Date.now() - p.lastAccessed > 300000 && p.priority === 'low'
          );
          return unusedComponents.length > 5;
        },
        action: (_, patterns) => {
          const unused = patterns.filter(p => 
            Date.now() - p.lastAccessed > 300000 && p.priority === 'low'
          );
          return {
            type: 'cache_clear',
            target: unused.map(u => u.componentName).join(', '),
            reason: `تنظيف ${unused.length} مكون غير مستخدم`,
            impact: 'medium'
          };
        },
        priority: 2
      },
      {
        id: 'frequent_access_preload',
        name: 'تحميل مسبق للمكونات المستخدمة كثيراً',
        condition: (_, patterns) => {
          const frequent = patterns.filter(p => 
            p.frequency > 10 && p.priority === 'high'
          );
          return frequent.length > 0;
        },
        action: (_, patterns) => {
          const frequent = patterns.filter(p => 
            p.frequency > 10 && p.priority === 'high'
          );
          return {
            type: 'preload',
            target: frequent.map(f => f.componentName).join(', '),
            reason: `تحميل مسبق لـ ${frequent.length} مكون مستخدم بكثرة`,
            impact: 'medium'
          };
        },
        priority: 3
      },
      {
        id: 'slow_render_optimization',
        name: 'تحسين المكونات بطيئة الرسم',
        condition: (_, patterns) => {
          const slowComponents = patterns.filter(p => p.renderTime > 100);
          return slowComponents.length > 0;
        },
        action: (_, patterns) => {
          const slow = patterns.filter(p => p.renderTime > 100);
          return {
            type: 'lazy_load',
            target: slow.map(s => s.componentName).join(', '),
            reason: `تحسين ${slow.length} مكون بطيء الرسم`,
            impact: 'high'
          };
        },
        priority: 4
      },
      {
        id: 'memory_leak_detection',
        name: 'كشف تسريب الذاكرة',
        condition: (metrics) => {
          if (metrics.length < 10) return false;
          const recent = this.metrics.slice(-10);
          const trend = recent.reduce((acc, curr, idx) => {
            if (idx === 0) return acc;
            return acc + (curr.memoryUsage - recent[idx - 1].memoryUsage);
          }, 0);
          return trend > 50; // Memory increasing by 50MB over 10 measurements
        },
        action: () => ({
          type: 'gc_suggestion',
          reason: 'اكتشاف احتمال تسريب في الذاكرة',
          impact: 'high'
        }),
        priority: 1
      }
    ];
  }

  // Start monitoring system resources
  private startMonitoring(): void {
    if (typeof window === 'undefined') return;

    // Monitor every 10 seconds
    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, 10000);

    // Run optimization every 30 seconds
    this.optimizationInterval = setInterval(() => {
      this.runOptimization();
    }, 30000);
  }

  // Collect current system metrics
  private collectMetrics(): void {
    if (!this.isActive || typeof window === 'undefined') return;

    const metrics: ResourceMetrics = {
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCPUUsage(),
      renderCount: this.getRenderCount(),
      errorCount: this.getErrorCount(),
      loadTime: performance.now(),
      timestamp: Date.now()
    };

    this.metrics.push(metrics);

    // Keep only last 100 metrics
    if (this.metrics.length > 100) {
      this.metrics.shift();
    }
  }

  // Get current memory usage
  private getMemoryUsage(): number {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      const memory = (performance as any).memory;
      return Math.round(memory.usedJSHeapSize / 1048576); // MB
    }
    return 0;
  }

  // Estimate CPU usage based on frame timing
  private getCPUUsage(): number {
    // Simplified CPU usage estimation
    const entries = performance.getEntriesByType('measure');
    if (entries.length === 0) return 0;
    
    const recent = entries.slice(-10);
    const avgDuration = recent.reduce((sum, entry) => sum + entry.duration, 0) / recent.length;
    return Math.min(avgDuration / 16.67 * 100, 100); // Percentage based on 60fps target
  }

  // Get render count from performance entries
  private getRenderCount(): number {
    const entries = performance.getEntriesByType('measure');
    return entries.filter(entry => entry.name.includes('render')).length;
  }

  // Get error count (would be integrated with error tracking)
  private getErrorCount(): number {
    // This would integrate with actual error tracking
    return 0;
  }

  // Track component usage pattern
  public trackUsage(componentName: string, renderTime: number): void {
    const existing = this.patterns.get(componentName);
    const now = Date.now();

    if (existing) {
      existing.frequency += 1;
      existing.renderTime = (existing.renderTime + renderTime) / 2; // Moving average
      existing.lastAccessed = now;
      existing.accessCount += 1;
      
      // Update priority based on usage
      if (existing.frequency > 20) existing.priority = 'high';
      else if (existing.frequency > 5) existing.priority = 'medium';
      else existing.priority = 'low';
    } else {
      const pattern: UsagePattern = {
        componentName,
        frequency: 1,
        memoryUsage: this.getMemoryUsage(),
        renderTime,
        priority: 'low',
        lastAccessed: now,
        accessCount: 1
      };
      this.patterns.set(componentName, pattern);
    }
  }

  // Run optimization based on current metrics and patterns
  private runOptimization(): void {
    if (!this.isActive || this.metrics.length === 0) return;

    const currentMetrics = this.metrics[this.metrics.length - 1];
    const patterns = Array.from(this.patterns.values());

    // Sort rules by priority
    const sortedRules = [...this.optimizationRules].sort((a, b) => a.priority - b.priority);

    const actions: OptimizationAction[] = [];

    for (const rule of sortedRules) {
      if (rule.condition(currentMetrics, patterns)) {
        const action = rule.action(currentMetrics, patterns);
        actions.push(action);
        
        // Execute the optimization action
        this.executeOptimization(action);
      }
    }

    if (actions.length > 0) {
      console.log('تم تنفيذ تحسينات تلقائية:', actions);
    }
  }

  // Execute optimization action
  private executeOptimization(action: OptimizationAction): void {
    switch (action.type) {
      case 'memory_cleanup':
        this.performMemoryCleanup();
        break;
      case 'cache_clear':
        this.clearUnusedCache(action.target);
        break;
      case 'lazy_load':
        this.enableLazyLoading(action.target);
        break;
      case 'preload':
        this.preloadComponents(action.target);
        break;
      case 'gc_suggestion':
        this.suggestGarbageCollection();
        break;
    }
  }

  // Perform memory cleanup
  private performMemoryCleanup(): void {
    // Clear old patterns
    const now = Date.now();
    for (const [key, pattern] of this.patterns.entries()) {
      if (now - pattern.lastAccessed > 600000) { // 10 minutes
        this.patterns.delete(key);
      }
    }

    // Clear old metrics
    if (this.metrics.length > 50) {
      this.metrics.splice(0, this.metrics.length - 50);
    }

    // Force garbage collection if available
    if (typeof window !== 'undefined' && 'gc' in window) {
      (window as any).gc();
    }
  }

  // Clear unused cache entries
  private clearUnusedCache(target?: string): void {
    if (target) {
      const components = target.split(', ');
      components.forEach(comp => {
        this.patterns.delete(comp);
      });
    }
  }

  // Enable lazy loading for slow components
  private enableLazyLoading(target?: string): void {
    if (target) {
      console.log(`تفعيل التحميل الكسول للمكونات: ${target}`);
      // This would integrate with the component loading system
    }
  }

  // Preload frequently used components
  private preloadComponents(target?: string): void {
    if (target) {
      console.log(`تحميل مسبق للمكونات: ${target}`);
      // This would integrate with the component preloading system
    }
  }

  // Suggest garbage collection
  private suggestGarbageCollection(): void {
    console.warn('تم اكتشاف احتمال تسريب في الذاكرة - يُنصح بإعادة تشغيل التطبيق');
    // Could trigger a notification to the user
  }

  // Get optimization statistics
  public getOptimizationStats() {
    const currentMetrics = this.metrics[this.metrics.length - 1];
    const patterns = Array.from(this.patterns.values());

    return {
      currentMemory: currentMetrics?.memoryUsage || 0,
      totalComponents: patterns.length,
      highPriorityComponents: patterns.filter(p => p.priority === 'high').length,
      mediumPriorityComponents: patterns.filter(p => p.priority === 'medium').length,
      lowPriorityComponents: patterns.filter(p => p.priority === 'low').length,
      averageRenderTime: patterns.reduce((sum, p) => sum + p.renderTime, 0) / patterns.length || 0,
      totalOptimizations: this.metrics.length,
      isActive: this.isActive
    };
  }

  // Enable/disable automatic optimization
  public setActive(active: boolean): void {
    this.isActive = active;
    if (!active) {
      if (this.monitoringInterval) clearInterval(this.monitoringInterval);
      if (this.optimizationInterval) clearInterval(this.optimizationInterval);
    } else {
      this.startMonitoring();
    }
  }

  // Add custom optimization rule
  public addOptimizationRule(rule: OptimizationRule): void {
    this.optimizationRules.push(rule);
    this.optimizationRules.sort((a, b) => a.priority - b.priority);
  }

  // Get detailed metrics for dashboard
  public getDetailedMetrics() {
    return {
      metrics: this.metrics.slice(-20), // Last 20 measurements
      patterns: Array.from(this.patterns.values()),
      rules: this.optimizationRules.map(r => ({
        id: r.id,
        name: r.name,
        priority: r.priority
      }))
    };
  }

  // Cleanup resources
  public destroy(): void {
    this.isActive = false;
    if (this.monitoringInterval) clearInterval(this.monitoringInterval);
    if (this.optimizationInterval) clearInterval(this.optimizationInterval);
    this.patterns.clear();
    this.metrics.length = 0;
  }
}

// React hook for component usage tracking
export function useResourceOptimization(componentName: string) {
  const optimizer = AutoResourceOptimizer.getInstance();
  const startTime = React.useRef<number>();

  React.useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current) {
        const renderTime = performance.now() - startTime.current;
        optimizer.trackUsage(componentName, renderTime);
      }
    };
  });

  return {
    trackUsage: (customRenderTime?: number) => {
      if (customRenderTime !== undefined) {
        optimizer.trackUsage(componentName, customRenderTime);
      }
    }
  };
}

// React hook for optimization stats
export function useOptimizationStats() {
  const [stats, setStats] = React.useState(() => 
    AutoResourceOptimizer.getInstance().getOptimizationStats()
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setStats(AutoResourceOptimizer.getInstance().getOptimizationStats());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return stats;
}

// Initialize auto resource optimizer
export function initializeAutoResourceOptimizer(): void {
  const optimizer = AutoResourceOptimizer.getInstance();
  
  // Add Arabic-specific optimization rules
  optimizer.addOptimizationRule({
    id: 'arabic_text_rendering',
    name: 'تحسين رسم النصوص العربية',
    condition: (_, patterns) => {
      const arabicComponents = patterns.filter(p => 
        p.componentName.includes('Arabic') || p.renderTime > 50
      );
      return arabicComponents.length > 3;
    },
    action: (_, patterns) => {
      const arabic = patterns.filter(p => 
        p.componentName.includes('Arabic') || p.renderTime > 50
      );
      return {
        type: 'lazy_load',
        target: arabic.map(a => a.componentName).join(', '),
        reason: 'تحسين رسم النصوص العربية الثقيلة',
        impact: 'medium'
      };
    },
    priority: 3
  });

  console.log('تم تفعيل نظام التحسين التلقائي للموارد');
}

// Export singleton instance
export const autoResourceOptimizer = AutoResourceOptimizer.getInstance();

// Import React for hooks
import React from 'react';