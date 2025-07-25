# 🔧 دليل إصلاح الأخطاء الشائعة - صحيفة سبق الذكية

## 🚨 الأخطاء الأكثر شيوعاً وحلولها

### **1. خطأ: "Can't find variable: cn"**
```bash
❌ المشكلة: Can't find variable: cn
✅ الحل:
```

**الحل الأول - إعادة تثبيت tailwind-merge:**
```bash
npm uninstall tailwind-merge
npm install tailwind-merge@latest
```

**الحل الثاني - فحص ملف utils.ts:**
```typescript
// src/lib/utils.ts
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

**الحل الثالث - استخدام الوضع الآمن:**
```bash
# أضف هذا إلى الرابط
http://localhost:5173?safe=true
```

---

### **2. خطأ: "t.forEach is not a function"**
```bash
❌ المشكلة: t.forEach is not a function
✅ الحل:
```

**إعادة تشغيل في الوضع الطارئ:**
```bash
http://localhost:5173?emergency=true
```

**تنظيف الكاش:**
```bash
rm -rf node_modules package-lock.json .vite
npm install
npm run dev
```

---

### **3. خطأ: "undefined is not an object"**
```bash
❌ المشكلة: undefined is not an object (evaluating 'x.property')
✅ الحل:
```

**فحص البيانات المحفوظة:**
```javascript
// في وحدة تحكم المتصفح
localStorage.clear();
location.reload();
```

**إعادة تعيين KV Store:**
```javascript
// في وحدة تحكم المتصفح
if (window.spark?.kv) {
  const keys = await window.spark.kv.keys();
  for (const key of keys) {
    await window.spark.kv.delete(key);
  }
}
location.reload();
```

---

### **4. مشكلة الصفحة البيضاء**
```bash
❌ المشكلة: الصفحة تظهر بيضاء بدون محتوى
✅ الحل:
```

**التدرج في الحلول:**
```bash
# 1. الوضع الآمن
http://localhost:5173?safe=true

# 2. الوضع الطارئ
http://localhost:5173?emergency=true

# 3. الوضع المبسط
http://localhost:5173?minimal=true

# 4. إعادة تشغيل كاملة
npm run dev -- --force
```

---

### **5. مشاكل الخطوط العربية**
```bash
❌ المشكلة: الخطوط العربية لا تظهر بشكل صحيح
✅ الحل:
```

**فحص تحميل الخطوط:**
```javascript
// في وحدة تحكم المتصفح
console.log(document.fonts.check('16px "IBM Plex Sans Arabic"'));
```

**إعادة تحميل الخطوط:**
```html
<!-- في index.html -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

---

### **6. مشاكل RTL (Right-to-Left)**
```bash
❌ المشكلة: الواجهة لا تدعم الاتجاه من اليمين لليسار
✅ الحل:
```

**فحص إعدادات اللغة:**
```javascript
// في وحدة تحكم المتصفح
console.log(document.documentElement.getAttribute('dir'));
console.log(document.documentElement.getAttribute('lang'));
```

**إصلاح RTL يدوياً:**
```javascript
// في وحدة تحكم المتصفح
document.documentElement.setAttribute('dir', 'rtl');
document.documentElement.setAttribute('lang', 'ar');
```

---

### **7. أخطاء TypeScript**
```bash
❌ المشكلة: Type errors في وحدة التحكم
✅ الحل:
```

**تشغيل فحص TypeScript:**
```bash
npx tsc --noEmit
```

**إصلاح الأخطاء الشائعة:**
```bash
# تحديث types
npm install --save-dev @types/node @types/react @types/react-dom

# فحص tsconfig.json
cat tsconfig.json
```

---

### **8. مشاكل GitHub Spark Integration**
```bash
❌ المشكلة: Spark APIs غير متاحة
✅ الحل:
```

**فحص Spark APIs:**
```javascript
// في وحدة تحكم المتصفح
console.log('Spark available:', typeof window.spark !== 'undefined');
console.log('Spark KV:', typeof window.spark?.kv !== 'undefined');
console.log('Spark LLM:', typeof window.spark?.llm !== 'undefined');
```

**إعادة تحميل Spark:**
```bash
# في terminal
npm install @github/spark@latest
```

---

### **9. مشاكل الذاكرة والأداء**
```bash
❌ المشكلة: التطبيق بطيء أو يستهلك ذاكرة كبيرة
✅ الحل:
```

**فحص استخدام الذاكرة:**
```javascript
// في وحدة تحكم المتصفح
if (performance.memory) {
  const used = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
  const total = Math.round(performance.memory.totalJSHeapSize / 1024 / 1024);
  const limit = Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024);
  console.log(`Memory: ${used}MB / ${limit}MB`);
}
```

**تحسين الأداء:**
```bash
# زيادة حد الذاكرة
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

---

### **10. مشاكل Tailwind CSS**
```bash
❌ المشكلة: Styles لا تطبق بشكل صحيح
✅ الحل:
```

**فحص Tailwind CSS:**
```javascript
// في وحدة تحكم المتصفح
const styles = getComputedStyle(document.documentElement);
console.log('Background color:', styles.getPropertyValue('--background'));
console.log('Primary color:', styles.getPropertyValue('--primary'));
```

**إعادة بناء Tailwind:**
```bash
rm -rf .vite
npm run dev
```

---

## 🔍 أدوات التشخيص السريع

### **فحص صحة النظام الشامل**
```javascript
// نسخ ولصق في وحدة تحكم المتصفح
(async function systemHealthCheck() {
  const results = [];
  
  // فحص React
  try {
    results.push(`✅ React: ${React.version}`);
  } catch {
    results.push(`❌ React: غير متاح`);
  }
  
  // فحص Spark
  if (typeof window.spark !== 'undefined') {
    results.push(`✅ GitHub Spark: متاح`);
  } else {
    results.push(`❌ GitHub Spark: غير متاح`);
  }
  
  // فحص Tailwind
  const hasCSS = getComputedStyle(document.documentElement).getPropertyValue('--background').trim() !== '';
  results.push(`${hasCSS ? '✅' : '❌'} Tailwind CSS: ${hasCSS ? 'محمل' : 'غير محمل'}`);
  
  // فحص الخطوط
  const hasFont = document.fonts.check('16px "IBM Plex Sans Arabic"');
  results.push(`${hasFont ? '✅' : '⚠️'} Arabic Font: ${hasFont ? 'محمل' : 'غير محمل'}`);
  
  // فحص LocalStorage
  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    results.push(`✅ LocalStorage: يعمل`);
  } catch {
    results.push(`❌ LocalStorage: لا يعمل`);
  }
  
  // فحص الذاكرة
  if (performance.memory) {
    const usage = Math.round((performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100);
    results.push(`${usage > 80 ? '⚠️' : '✅'} Memory: ${usage}%`);
  }
  
  console.log('🏥 تقرير صحة النظام:');
  results.forEach(result => console.log(result));
  
  return results;
})();
```

### **إعادة تعيين شاملة للنظام**
```javascript
// نسخ ولصق في وحدة تحكم المتصفح
(async function fullSystemReset() {
  console.log('🔄 بدء إعادة تعيين النظام...');
  
  // مسح LocalStorage
  localStorage.clear();
  console.log('✅ تم مسح LocalStorage');
  
  // مسح SessionStorage
  sessionStorage.clear();
  console.log('✅ تم مسح SessionStorage');
  
  // مسح KV Store
  try {
    if (window.spark?.kv) {
      const keys = await window.spark.kv.keys();
      for (const key of keys) {
        await window.spark.kv.delete(key);
      }
      console.log('✅ تم مسح KV Store');
    }
  } catch (error) {
    console.log('⚠️ لم يتم مسح KV Store:', error.message);
  }
  
  // إعادة تحميل الصفحة
  console.log('🔄 إعادة تحميل الصفحة...');
  location.reload();
})();
```

---

## 🆘 الحصول على المساعدة

### **جمع معلومات النظام للدعم الفني**
```javascript
// نسخ ولصق في وحدة تحكم المتصفح
(function collectSystemInfo() {
  const info = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    url: location.href,
    react: typeof React !== 'undefined' ? React.version : 'غير متاح',
    spark: typeof window.spark !== 'undefined',
    memory: performance.memory ? {
      used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) + 'MB',
      total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024) + 'MB',
      limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
    } : 'غير متاح',
    localStorage: (() => {
      try {
        return localStorage.length + ' items';
      } catch {
        return 'غير متاح';
      }
    })(),
    online: navigator.onLine,
    language: navigator.language,
    platform: navigator.platform
  };
  
  console.log('📋 معلومات النظام للدعم الفني:');
  console.log(JSON.stringify(info, null, 2));
  
  // نسخ إلى الحافظة
  navigator.clipboard.writeText(JSON.stringify(info, null, 2)).then(() => {
    console.log('✅ تم نسخ المعلومات إلى الحافظة');
  });
  
  return info;
})();
```

### **أرقام الدعم الفني**
- 📧 **البريد الإلكتروني**: support@sabq.org
- 📱 **الهاتف**: 920000000
- 💬 **الدردشة المباشرة**: متاحة في الموقع
- 🐛 **تقارير الأخطاء**: GitHub Issues

---

*💡 **نصيحة**: احتفظ بهذا الدليل مرجعياً، وجرب الحلول بالترتيب المذكور للحصول على أفضل النتائج*