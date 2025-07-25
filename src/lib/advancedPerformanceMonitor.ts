/**
 * Advanced Performance Monitor
 * Provides detailed system monitoring and optimization tools
 */

export interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    limit: number;
    percentage: number;
  };
  performance: {
    fps: number;
    avgRenderTime: number;
    componentCount: number;
    totalRenderTime: number;
  };
  cache: {
    size: number;
    keys: string[];
    efficiency: number;
  };
  network: {
    type: string;
    speed: number;
    latency: number;
  };
  errors: {
    count: number;
    recent: string[];
  };
}

export class AdvancedPerformanceMonitor {
  private static instance: AdvancedPerformanceMonitor;
  private metrics: SystemMetrics;
  private observers: PerformanceObserver[] = [];
  private errorLog: string[] = [];

  private constructor() {
    this.metrics = {
      memory: { used: 0, total: 0, limit: 0, percentage: 0 },
      performance: { fps: 60, avgRenderTime: 0, componentCount: 0, totalRenderTime: 0 },
      cache: { size: 0, keys: [], efficiency: 0 },
      network: { type: 'unknown', speed: 0, latency: 0 },
      errors: { count: 0, recent: [] }
    };

    this.initializeObservers();
  }

  static getInstance(): AdvancedPerformanceMonitor {
    if (!AdvancedPerformanceMonitor.instance) {
      AdvancedPerformanceMonitor.instance = new AdvancedPerformanceMonitor();
    }
    return AdvancedPerformanceMonitor.instance;
  }

  private initializeObservers(): void {
    // Long Task Observer
    if ('PerformanceObserver' in window) {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.duration > 50) {
              this.logPerformanceIssue(`Long task: ${entry.duration.toFixed(2)}ms`);
            }
          });
        });
        longTaskObserver.observe({ entryTypes: ['longtask'] });
        this.observers.push(longTaskObserver);
      } catch (error) {
        console.warn('Long task observer not supported');
      }

      // Layout Shift Observer
      try {
        const layoutShiftObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry: any) => {
            if (entry.value > 0.1) {
              this.logPerformanceIssue(`Layout shift detected: ${entry.value.toFixed(3)}`);
            }
          });
        });
        layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.push(layoutShiftObserver);
      } catch (error) {
        console.warn('Layout shift observer not supported');
      }

      // Largest Contentful Paint Observer
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry && lastEntry.startTime > 2500) {
            this.logPerformanceIssue(`Slow LCP: ${lastEntry.startTime.toFixed(0)}ms`);
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.push(lcpObserver);
      } catch (error) {
        console.warn('LCP observer not supported');
      }
    }
  }

  private logPerformanceIssue(message: string): void {
    this.errorLog.push(`${new Date().toISOString()}: ${message}`);
    this.errorLog = this.errorLog.slice(-50); // Keep last 50 entries
    this.metrics.errors.count++;
    this.metrics.errors.recent = this.errorLog.slice(-10);
  }

  updateMetrics(): SystemMetrics {
    // Memory metrics
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.metrics.memory = {
        used: Math.round(memory.usedJSHeapSize / 1048576),
        total: Math.round(memory.totalJSHeapSize / 1048576),
        limit: Math.round(memory.jsHeapSizeLimit / 1048576),
        percentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
      };
    }

    // Network metrics
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.metrics.network = {
        type: connection.effectiveType || 'unknown',
        speed: connection.downlink || 0,
        latency: connection.rtt || 0
      };
    }

    return this.metrics;
  }

  analyzePerformance(): {
    score: number;
    issues: string[];
    recommendations: string[];
  } {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Memory analysis
    if (this.metrics.memory.percentage > 85) {
      issues.push('استخدام الذاكرة مرتفع جداً');
      recommendations.push('قم بمسح التخزين المؤقت أو إعادة تحميل الصفحة');
      score -= 30;
    } else if (this.metrics.memory.percentage > 70) {
      issues.push('استخدام الذاكرة مرتفع');
      recommendations.push('راقب استخدام الذاكرة عن كثب');
      score -= 15;
    }

    // Performance analysis
    if (this.metrics.performance.avgRenderTime > 33) {
      issues.push('وقت العرض بطيء');
      recommendations.push('قلل من عدد المكونات المعقدة');
      score -= 25;
    } else if (this.metrics.performance.avgRenderTime > 16) {
      issues.push('وقت العرض متوسط');
      recommendations.push('حسّن كود المكونات للحصول على أداء أفضل');
      score -= 10;
    }

    // Component count analysis
    if (this.metrics.performance.componentCount > 30) {
      issues.push('عدد كبير من المكونات النشطة');
      recommendations.push('استخدم lazy loading للمكونات غير المهمة');
      score -= 15;
    }

    // Cache analysis
    if (this.metrics.cache.size > 100) {
      issues.push('حجم التخزين المؤقت كبير');
      recommendations.push('امسح البيانات القديمة من التخزين المؤقت');
      score -= 10;
    }

    // Network analysis
    if (this.metrics.network.latency > 300) {
      issues.push('زمن استجابة الشبكة مرتفع');
      recommendations.push('تحقق من اتصال الإنترنت');
      score -= 20;
    }

    return {
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  getDetailedReport(): string {
    const analysis = this.analyzePerformance();
    const metrics = this.updateMetrics();
    
    return `
=== تقرير الأداء المفصل ===
النتيجة العامة: ${analysis.score}/100

الذاكرة:
- المستخدم: ${metrics.memory.used} MB (${metrics.memory.percentage.toFixed(1)}%)
- الإجمالي: ${metrics.memory.total} MB
- الحد الأقصى: ${metrics.memory.limit} MB

الأداء:
- FPS: ${metrics.performance.fps}
- متوسط وقت العرض: ${metrics.performance.avgRenderTime.toFixed(2)}ms
- عدد المكونات: ${metrics.performance.componentCount}

الشبكة:
- النوع: ${metrics.network.type}
- السرعة: ${metrics.network.speed} Mbps
- زمن الاستجابة: ${metrics.network.latency}ms

التخزين المؤقت:
- الحجم: ${metrics.cache.size} عنصر
- الكفاءة: ${metrics.cache.efficiency.toFixed(1)}%

المشاكل المكتشفة:
${analysis.issues.map(issue => `- ${issue}`).join('\n')}

التوصيات:
${analysis.recommendations.map(rec => `- ${rec}`).join('\n')}

آخر الأخطاء:
${metrics.errors.recent.slice(-5).map(error => `- ${error}`).join('\n')}
    `;
  }

  optimizeSystem(): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        // Clear caches
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
        }

        // Clear console
        console.clear();

        // Force garbage collection if available
        if ('gc' in window && typeof (window as any).gc === 'function') {
          (window as any).gc();
        }

        // Clear error log
        this.errorLog = [];
        this.metrics.errors = { count: 0, recent: [] };

        console.log('System optimization completed');
        resolve(true);
      } catch (error) {
        console.error('System optimization failed:', error);
        resolve(false);
      }
    });
  }

  dispose(): void {
    this.observers.forEach(observer => {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn('Failed to disconnect observer:', error);
      }
    });
    this.observers = [];
  }
}

export default AdvancedPerformanceMonitor;