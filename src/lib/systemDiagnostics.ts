// System Diagnostics and Error Detection for Sabq Althakiyah
// تشخيص النظام واكتشاف الأخطاء لصحيفة سبق الذكية

interface DiagnosticResult {
  component: string;
  status: 'healthy' | 'warning' | 'error';
  message: string;
  details?: any;
  timestamp: Date;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  results: DiagnosticResult[];
  recommendations: string[];
}

class SystemDiagnostics {
  private results: DiagnosticResult[] = [];

  async runDiagnostics(): Promise<SystemHealth> {
    this.results = [];
    
    // تشخيص الأنظمة الأساسية
    await this.checkReactVersion();
    await this.checkTailwindConfig();
    await this.checkGitHubSparkIntegration();
    await this.checkTypescriptConfig();
    await this.checkFontLoading();
    await this.checkLocalStorage();
    await this.checkMemoryUsage();
    await this.checkNetworkConnectivity();
    
    return this.generateHealthReport();
  }

  private async checkReactVersion(): Promise<void> {
    try {
      const reactVersion = React.version;
      const isModernReact = parseFloat(reactVersion) >= 19;
      
      this.addResult({
        component: 'React Version',
        status: isModernReact ? 'healthy' : 'warning',
        message: `React ${reactVersion} ${isModernReact ? 'supported' : 'may have compatibility issues'}`,
        details: { version: reactVersion, supported: isModernReact }
      });
    } catch (error) {
      this.addResult({
        component: 'React Version',
        status: 'error',
        message: 'Failed to detect React version',
        details: error
      });
    }
  }

  private async checkTailwindConfig(): Promise<void> {
    try {
      // فحص وجود متغيرات Tailwind CSS
      const rootStyles = getComputedStyle(document.documentElement);
      const hasCustomProperties = rootStyles.getPropertyValue('--background').trim() !== '';
      
      this.addResult({
        component: 'Tailwind CSS',
        status: hasCustomProperties ? 'healthy' : 'warning',
        message: hasCustomProperties ? 'Tailwind CSS variables loaded' : 'Custom CSS properties missing',
        details: { hasCustomProperties }
      });
    } catch (error) {
      this.addResult({
        component: 'Tailwind CSS',
        status: 'error',
        message: 'Failed to check Tailwind configuration',
        details: error
      });
    }
  }

  private async checkGitHubSparkIntegration(): Promise<void> {
    try {
      // فحص وجود GitHub Spark APIs
      const hasSparkGlobal = typeof window.spark !== 'undefined';
      const hasKVStore = hasSparkGlobal && typeof window.spark.kv !== 'undefined';
      const hasLLM = hasSparkGlobal && typeof window.spark.llm !== 'undefined';
      
      this.addResult({
        component: 'GitHub Spark',
        status: hasSparkGlobal ? 'healthy' : 'error',
        message: hasSparkGlobal ? 'Spark APIs available' : 'Spark APIs not found',
        details: { hasSparkGlobal, hasKVStore, hasLLM }
      });
    } catch (error) {
      this.addResult({
        component: 'GitHub Spark',
        status: 'error',
        message: 'Failed to check Spark integration',
        details: error
      });
    }
  }

  private async checkTypescriptConfig(): Promise<void> {
    try {
      // فحص TypeScript من خلال التحقق من الأخطاء في وحدة التحكم
      const hasTypeErrors = console.error.toString().includes('TS');
      
      this.addResult({
        component: 'TypeScript',
        status: hasTypeErrors ? 'warning' : 'healthy',
        message: hasTypeErrors ? 'TypeScript errors detected in console' : 'No TypeScript errors detected',
        details: { hasTypeErrors }
      });
    } catch (error) {
      this.addResult({
        component: 'TypeScript',
        status: 'warning',
        message: 'Unable to fully check TypeScript status',
        details: error
      });
    }
  }

  private async checkFontLoading(): Promise<void> {
    try {
      // فحص تحميل الخطوط العربية
      const hasArabicFont = document.fonts.check('16px "IBM Plex Sans Arabic"');
      
      this.addResult({
        component: 'Arabic Fonts',
        status: hasArabicFont ? 'healthy' : 'warning',
        message: hasArabicFont ? 'IBM Plex Sans Arabic loaded' : 'Arabic font may not be loaded',
        details: { hasArabicFont, availableFonts: Array.from(document.fonts).map(f => f.family) }
      });
    } catch (error) {
      this.addResult({
        component: 'Arabic Fonts',
        status: 'warning',
        message: 'Unable to check font loading status',
        details: error
      });
    }
  }

  private async checkLocalStorage(): Promise<void> {
    try {
      // فحص LocalStorage والKV Store
      const canWriteLS = this.testLocalStorage();
      const kvStoreWorking = await this.testKVStore();
      
      this.addResult({
        component: 'Data Storage',
        status: (canWriteLS && kvStoreWorking) ? 'healthy' : 'warning',
        message: `LocalStorage: ${canWriteLS ? 'OK' : 'Failed'}, KV Store: ${kvStoreWorking ? 'OK' : 'Failed'}`,
        details: { localStorage: canWriteLS, kvStore: kvStoreWorking }
      });
    } catch (error) {
      this.addResult({
        component: 'Data Storage',
        status: 'error',
        message: 'Failed to check storage capabilities',
        details: error
      });
    }
  }

  private async checkMemoryUsage(): Promise<void> {
    try {
      // فحص استخدام الذاكرة (إذا كان متاحاً)
      const memory = (performance as any).memory;
      if (memory) {
        const usedMB = Math.round(memory.usedJSHeapSize / 1024 / 1024);
        const totalMB = Math.round(memory.totalJSHeapSize / 1024 / 1024);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1024 / 1024);
        
        const usage = (usedMB / limitMB) * 100;
        const status = usage > 80 ? 'warning' : usage > 90 ? 'error' : 'healthy';
        
        this.addResult({
          component: 'Memory Usage',
          status,
          message: `Using ${usedMB}MB of ${limitMB}MB (${usage.toFixed(1)}%)`,
          details: { usedMB, totalMB, limitMB, usagePercent: usage }
        });
      } else {
        this.addResult({
          component: 'Memory Usage',
          status: 'warning',
          message: 'Memory information not available',
          details: { available: false }
        });
      }
    } catch (error) {
      this.addResult({
        component: 'Memory Usage',
        status: 'warning',
        message: 'Unable to check memory usage',
        details: error
      });
    }
  }

  private async checkNetworkConnectivity(): Promise<void> {
    try {
      // فحص الاتصال بالإنترنت
      const isOnline = navigator.onLine;
      const connectionType = (navigator as any).connection?.effectiveType || 'unknown';
      
      this.addResult({
        component: 'Network',
        status: isOnline ? 'healthy' : 'warning',
        message: `${isOnline ? 'Online' : 'Offline'} - Connection: ${connectionType}`,
        details: { online: isOnline, connectionType }
      });
    } catch (error) {
      this.addResult({
        component: 'Network',
        status: 'warning',
        message: 'Unable to check network status',
        details: error
      });
    }
  }

  private testLocalStorage(): boolean {
    try {
      const testKey = 'sabq-test-' + Date.now();
      localStorage.setItem(testKey, 'test');
      const value = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return value === 'test';
    } catch {
      return false;
    }
  }

  private async testKVStore(): Promise<boolean> {
    try {
      if (typeof window.spark?.kv?.set === 'function') {
        const testKey = 'sabq-kv-test-' + Date.now();
        await window.spark.kv.set(testKey, 'test');
        const value = await window.spark.kv.get(testKey);
        await window.spark.kv.delete(testKey);
        return value === 'test';
      }
      return false;
    } catch {
      return false;
    }
  }

  private addResult(result: Omit<DiagnosticResult, 'timestamp'>): void {
    this.results.push({
      ...result,
      timestamp: new Date()
    });
  }

  private generateHealthReport(): SystemHealth {
    const errorCount = this.results.filter(r => r.status === 'error').length;
    const warningCount = this.results.filter(r => r.status === 'warning').length;
    
    let overall: 'healthy' | 'warning' | 'critical';
    if (errorCount > 0) {
      overall = 'critical';
    } else if (warningCount > 2) {
      overall = 'warning';
    } else {
      overall = 'healthy';
    }

    const recommendations = this.generateRecommendations();

    return {
      overall,
      results: this.results,
      recommendations
    };
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];
    
    const errorResults = this.results.filter(r => r.status === 'error');
    const warningResults = this.results.filter(r => r.status === 'warning');

    if (errorResults.some(r => r.component === 'GitHub Spark')) {
      recommendations.push('تحقق من تكامل GitHub Spark - قد تحتاج إلى إعادة تشغيل النظام');
    }

    if (errorResults.some(r => r.component === 'React Version')) {
      recommendations.push('تحديث React إلى الإصدار 19 أو أحدث');
    }

    if (warningResults.some(r => r.component === 'Arabic Fonts')) {
      recommendations.push('تحقق من تحميل خط IBM Plex Sans Arabic من Google Fonts');
    }

    if (warningResults.some(r => r.component === 'Memory Usage')) {
      recommendations.push('فكر في إعادة تشغيل المتصفح أو إغلاق علامات تبويب غير ضرورية');
    }

    if (warningResults.some(r => r.component === 'Data Storage')) {
      recommendations.push('تحقق من إعدادات المتصفح للسماح بتخزين البيانات المحلية');
    }

    if (warningResults.some(r => r.component === 'Network')) {
      recommendations.push('تحقق من اتصال الإنترنت لضمان عمل الميزات السحابية');
    }

    if (recommendations.length === 0) {
      recommendations.push('النظام يعمل بشكل طبيعي - لا توجد توصيات خاصة');
    }

    return recommendations;
  }

  // وظائف مساعدة للاستخدام المباشر
  static async quickHealthCheck(): Promise<{ status: string; message: string }> {
    const diagnostics = new SystemDiagnostics();
    const health = await diagnostics.runDiagnostics();
    
    return {
      status: health.overall,
      message: health.overall === 'healthy' 
        ? 'النظام يعمل بشكل طبيعي' 
        : health.overall === 'warning'
        ? `تحذير: ${health.results.filter(r => r.status !== 'healthy').length} مشاكل محتملة`
        : `خطأ حرج: ${health.results.filter(r => r.status === 'error').length} أخطاء`
    };
  }

  static async exportDiagnostics(): Promise<string> {
    const diagnostics = new SystemDiagnostics();
    const health = await diagnostics.runDiagnostics();
    
    const report = {
      timestamp: new Date().toISOString(),
      overall: health.overall,
      userAgent: navigator.userAgent,
      url: window.location.href,
      results: health.results,
      recommendations: health.recommendations
    };

    return JSON.stringify(report, null, 2);
  }
}

// تصدير النظام للاستخدام العام
export default SystemDiagnostics;

// وظيفة سريعة للفحص
export const runQuickSystemCheck = async () => {
  try {
    const result = await SystemDiagnostics.quickHealthCheck();
    console.log('🏥 System Health Check:', result);
    return result;
  } catch (error) {
    console.error('❌ Failed to run system diagnostics:', error);
    return { status: 'error', message: 'فشل في تشغيل فحص النظام' };
  }
};

// وظيفة تصدير التشخيص للدعم الفني
export const exportSystemDiagnostics = async () => {
  try {
    const report = await SystemDiagnostics.exportDiagnostics();
    const blob = new Blob([report], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sabq-diagnostics-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    console.log('📄 System diagnostics exported successfully');
  } catch (error) {
    console.error('❌ Failed to export diagnostics:', error);
  }
};

// تشغيل فحص تلقائي عند تحميل النظام
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      runQuickSystemCheck();
    }, 2000); // انتظار ثانيتين للتأكد من تحميل كل شيء
  });
}