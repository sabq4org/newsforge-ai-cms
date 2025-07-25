#!/usr/bin/env node

/**
 * Sabq Althakiyah - Quick System Diagnostics Tool
 * أداة التشخيص السريع لصحيفة سبق الذكية
 * 
 * Usage: node diagnostic-tool.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class SabqDiagnostics {
  constructor() {
    this.issues = [];
    this.suggestions = [];
    this.projectRoot = process.cwd();
  }

  async run() {
    console.log('🔍 بدء تشخيص نظام سبق الذكية...\n');
    
    await this.checkNodeVersion();
    await this.checkPackageJson();
    await this.checkDependencies();
    await this.checkTypeScript();
    await this.checkTailwindConfig();
    await this.checkViteConfig();
    await this.checkSourceFiles();
    await this.checkIndexHtml();
    
    this.generateReport();
  }

  async checkNodeVersion() {
    try {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
      
      if (majorVersion >= 18) {
        console.log('✅ Node.js:', nodeVersion, '(مدعوم)');
      } else {
        console.log('❌ Node.js:', nodeVersion, '(غير مدعوم - يتطلب 18+)');
        this.issues.push('تحديث Node.js إلى الإصدار 18 أو أحدث');
        this.suggestions.push('تحميل أحدث إصدار من https://nodejs.org');
      }
    } catch (error) {
      console.log('❌ فشل فحص إصدار Node.js');
      this.issues.push('مشكلة في فحص Node.js');
    }
  }

  async checkPackageJson() {
    try {
      const packagePath = path.join(this.projectRoot, 'package.json');
      
      if (!fs.existsSync(packagePath)) {
        console.log('❌ package.json: غير موجود');
        this.issues.push('ملف package.json غير موجود');
        return;
      }
      
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      console.log('✅ package.json: موجود');
      
      // فحص التبعيات الأساسية
      const requiredDeps = [
        'react',
        'react-dom',
        '@github/spark',
        'tailwindcss',
        'vite'
      ];
      
      const missingDeps = requiredDeps.filter(dep => 
        !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
      );
      
      if (missingDeps.length > 0) {
        console.log('⚠️  تبعيات مفقودة:', missingDeps.join(', '));
        this.issues.push(`تبعيات مفقودة: ${missingDeps.join(', ')}`);
        this.suggestions.push('تشغيل: npm install لتثبيت التبعيات');
      }
      
    } catch (error) {
      console.log('❌ خطأ في قراءة package.json:', error.message);
      this.issues.push('مشكلة في ملف package.json');
    }
  }

  async checkDependencies() {
    try {
      const nodeModulesPath = path.join(this.projectRoot, 'node_modules');
      
      if (!fs.existsSync(nodeModulesPath)) {
        console.log('❌ node_modules: غير موجود');
        this.issues.push('مجلد node_modules غير موجود');
        this.suggestions.push('تشغيل: npm install');
        return;
      }
      
      console.log('✅ node_modules: موجود');
      
      // فحص حجم node_modules
      try {
        const stats = fs.statSync(nodeModulesPath);
        console.log('📁 node_modules: تم التثبيت');
      } catch (error) {
        console.log('⚠️  مشكلة في قراءة node_modules');
      }
      
    } catch (error) {
      console.log('❌ خطأ في فحص التبعيات:', error.message);
      this.issues.push('مشكلة في فحص التبعيات');
    }
  }

  async checkTypeScript() {
    try {
      const tsconfigPath = path.join(this.projectRoot, 'tsconfig.json');
      
      if (!fs.existsSync(tsconfigPath)) {
        console.log('❌ tsconfig.json: غير موجود');
        this.issues.push('ملف tsconfig.json غير موجود');
        return;
      }
      
      console.log('✅ tsconfig.json: موجود');
      
      // فحص صحة TypeScript
      try {
        execSync('npx tsc --noEmit', { stdio: 'pipe', cwd: this.projectRoot });
        console.log('✅ TypeScript: لا توجد أخطاء');
      } catch (error) {
        console.log('⚠️  TypeScript: توجد أخطاء');
        this.issues.push('أخطاء TypeScript موجودة');
        this.suggestions.push('تشغيل: npx tsc --noEmit لرؤية الأخطاء');
      }
      
    } catch (error) {
      console.log('❌ خطأ في فحص TypeScript:', error.message);
      this.issues.push('مشكلة في فحص TypeScript');
    }
  }

  async checkTailwindConfig() {
    try {
      const tailwindPath = path.join(this.projectRoot, 'tailwind.config.js');
      
      if (!fs.existsSync(tailwindPath)) {
        console.log('❌ tailwind.config.js: غير موجود');
        this.issues.push('ملف tailwind.config.js غير موجود');
        return;
      }
      
      console.log('✅ tailwind.config.js: موجود');
      
      // فحص محتوى الملف
      const configContent = fs.readFileSync(tailwindPath, 'utf8');
      if (configContent.includes('content:')) {
        console.log('✅ Tailwind: مسارات المحتوى مكونة');
      } else {
        console.log('⚠️  Tailwind: مسارات المحتوى قد تكون مفقودة');
        this.issues.push('تكوين Tailwind قد يحتاج مراجعة');
      }
      
    } catch (error) {
      console.log('❌ خطأ في فحص Tailwind:', error.message);
      this.issues.push('مشكلة في فحص Tailwind');
    }
  }

  async checkViteConfig() {
    try {
      const vitePath = path.join(this.projectRoot, 'vite.config.ts');
      
      if (!fs.existsSync(vitePath)) {
        console.log('❌ vite.config.ts: غير موجود');
        this.issues.push('ملف vite.config.ts غير موجود');
        return;
      }
      
      console.log('✅ vite.config.ts: موجود');
      
      // فحص محتوى الملف
      const configContent = fs.readFileSync(vitePath, 'utf8');
      if (configContent.includes('@github/spark')) {
        console.log('✅ Vite: إعداد Spark مكون');
      } else {
        console.log('⚠️  Vite: إعداد Spark قد يكون مفقود');
        this.issues.push('تكوين Vite لـ Spark قد يحتاج مراجعة');
      }
      
    } catch (error) {
      console.log('❌ خطأ في فحص Vite:', error.message);
      this.issues.push('مشكلة في فحص Vite');
    }
  }

  async checkSourceFiles() {
    try {
      const srcPath = path.join(this.projectRoot, 'src');
      
      if (!fs.existsSync(srcPath)) {
        console.log('❌ src/: مجلد غير موجود');
        this.issues.push('مجلد src غير موجود');
        return;
      }
      
      console.log('✅ src/: موجود');
      
      // فحص الملفات الأساسية
      const requiredFiles = [
        'App.tsx',
        'main.tsx',
        'index.css'
      ];
      
      const missingFiles = requiredFiles.filter(file => 
        !fs.existsSync(path.join(srcPath, file))
      );
      
      if (missingFiles.length > 0) {
        console.log('❌ ملفات مفقودة:', missingFiles.join(', '));
        this.issues.push(`ملفات مفقودة: ${missingFiles.join(', ')}`);
      } else {
        console.log('✅ الملفات الأساسية: موجودة');
      }
      
      // فحص مجلد components
      const componentsPath = path.join(srcPath, 'components');
      if (fs.existsSync(componentsPath)) {
        console.log('✅ components/: موجود');
      } else {
        console.log('⚠️  components/: مجلد غير موجود');
        this.issues.push('مجلد components غير موجود');
      }
      
    } catch (error) {
      console.log('❌ خطأ في فحص الملفات المصدرية:', error.message);
      this.issues.push('مشكلة في فحص الملفات المصدرية');
    }
  }

  async checkIndexHtml() {
    try {
      const indexPath = path.join(this.projectRoot, 'index.html');
      
      if (!fs.existsSync(indexPath)) {
        console.log('❌ index.html: غير موجود');
        this.issues.push('ملف index.html غير موجود');
        return;
      }
      
      console.log('✅ index.html: موجود');
      
      const content = fs.readFileSync(indexPath, 'utf8');
      
      // فحص العناصر الأساسية
      if (content.includes('src="/src/main.tsx"')) {
        console.log('✅ index.html: رابط main.tsx صحيح');
      } else {
        console.log('❌ index.html: رابط main.tsx مفقود أو خاطئ');
        this.issues.push('رابط main.tsx في index.html غير صحيح');
      }
      
      if (content.includes('IBM Plex Sans Arabic')) {
        console.log('✅ index.html: خط عربي مكون');
      } else {
        console.log('⚠️  index.html: خط عربي قد يكون مفقود');
        this.suggestions.push('إضافة خط IBM Plex Sans Arabic');
      }
      
    } catch (error) {
      console.log('❌ خطأ في فحص index.html:', error.message);
      this.issues.push('مشكلة في فحص index.html');
    }
  }

  generateReport() {
    console.log('\n' + '='.repeat(50));
    console.log('📊 تقرير التشخيص النهائي');
    console.log('='.repeat(50));
    
    if (this.issues.length === 0) {
      console.log('🎉 ممتاز! لا توجد مشاكل واضحة في النظام');
      console.log('✅ يمكنك تشغيل المشروع بأمان: npm run dev');
    } else {
      console.log(`⚠️  تم العثور على ${this.issues.length} مشكلة:`);
      this.issues.forEach((issue, index) => {
        console.log(`   ${index + 1}. ${issue}`);
      });
    }
    
    if (this.suggestions.length > 0) {
      console.log('\n💡 اقتراحات للإصلاح:');
      this.suggestions.forEach((suggestion, index) => {
        console.log(`   ${index + 1}. ${suggestion}`);
      });
    }
    
    console.log('\n🚀 خطوات التشغيل الموصى بها:');
    if (this.issues.some(issue => issue.includes('node_modules'))) {
      console.log('   1. npm install');
    }
    if (this.issues.some(issue => issue.includes('TypeScript'))) {
      console.log('   2. npx tsc --noEmit (لفحص الأخطاء)');
    }
    console.log(`   ${this.issues.length > 0 ? '3' : '1'}. npm run dev`);
    
    console.log('\n📞 للدعم الفني:');
    console.log('   📧 support@sabq.org');
    console.log('   📱 920000000');
    console.log('   🌐 https://github.com/sabq4org/newsforge-ai-cms/issues');
    
    console.log('\n' + '='.repeat(50));
  }
}

// تشغيل التشخيص
if (require.main === module) {
  const diagnostics = new SabqDiagnostics();
  diagnostics.run().catch(console.error);
}

module.exports = SabqDiagnostics;