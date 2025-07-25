// Quick Test Script for Sabq Althakiyah CMS
// Run this in browser console to test system health

console.log('🧪 بدء اختبار نظام سبق الذكية...\n');

const tests = [
  {
    name: 'React و ReactDOM',
    test: () => typeof React !== 'undefined' && typeof ReactDOM !== 'undefined',
    fix: 'تأكد من تحميل React بشكل صحيح'
  },
  {
    name: 'Array.forEach',
    test: () => {
      const arr = [1, 2, 3];
      let sum = 0;
      arr.forEach(n => sum += n);
      return sum === 6;
    },
    fix: 'مشكلة في Array.prototype.forEach - استخدم الوضع الآمن'
  },
  {
    name: 'String.toLowerCase',
    test: () => 'HELLO'.toLowerCase() === 'hello',
    fix: 'مشكلة في String.prototype.toLowerCase - استخدم الوضع الآمن'
  },
  {
    name: 'Date.toLocaleDateString',
    test: () => {
      const date = new Date();
      return typeof date.toLocaleDateString() === 'string';
    },
    fix: 'مشكلة في Date.prototype.toLocaleDateString - استخدم الوضع الآمن'
  },
  {
    name: 'Local Storage',
    test: () => {
      try {
        localStorage.setItem('test', 'test');
        const value = localStorage.getItem('test');
        localStorage.removeItem('test');
        return value === 'test';
      } catch {
        return false;
      }
    },
    fix: 'Local Storage غير متاح - تحقق من إعدادات المتصفح'
  },
  {
    name: 'JSON',
    test: () => {
      const obj = { test: 'value' };
      return JSON.parse(JSON.stringify(obj)).test === 'value';
    },
    fix: 'مشكلة في JSON - تحقق من إعدادات المتصفح'
  },
  {
    name: 'CSS Variables',
    test: () => {
      try {
        const test = getComputedStyle(document.documentElement).getPropertyValue('--test');
        return true; // If no error, CSS vars are supported
      } catch {
        return false;
      }
    },
    fix: 'CSS Variables غير مدعومة - تحديث المتصفح مطلوب'
  },
  {
    name: 'Tailwind CSS',
    test: () => {
      // Check if tailwind classes exist
      const testDiv = document.createElement('div');
      testDiv.className = 'flex items-center';
      document.body.appendChild(testDiv);
      const styles = getComputedStyle(testDiv);
      document.body.removeChild(testDiv);
      return styles.display === 'flex';
    },
    fix: 'Tailwind CSS غير محمل بشكل صحيح'
  }
];

let passed = 0;
let failed = 0;

console.log('📋 تشغيل الاختبارات...\n');

tests.forEach((test, index) => {
  try {
    const result = test.test();
    if (result) {
      console.log(`✅ ${index + 1}. ${test.name}`);
      passed++;
    } else {
      console.log(`❌ ${index + 1}. ${test.name}`);
      console.log(`   🔧 الإصلاح: ${test.fix}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${index + 1}. ${test.name} - خطأ: ${error.message}`);
    console.log(`   🔧 الإصلاح: ${test.fix}`);
    failed++;
  }
});

console.log('\n📊 ملخص النتائج:');
console.log(`✅ نجح: ${passed}/${tests.length}`);
console.log(`❌ فشل: ${failed}/${tests.length}`);

if (failed === 0) {
  console.log('\n🎉 جميع الاختبارات نجحت! النظام جاهز للعمل.');
  console.log('🚀 يمكنك استخدام التطبيق العادي: /');
} else if (failed <= 2) {
  console.log('\n⚠️ بعض المشاكل البسيطة موجودة.');
  console.log('🛡️ يُنصح باستخدام الوضع الآمن المحسن: /?mode=ultimate-safe');
} else {
  console.log('\n🚨 مشاكل متعددة تم اكتشافها.');
  console.log('🆘 استخدم وضع الطوارئ: /?emergency=true');
}

console.log('\n🔗 روابط سريعة:');
console.log('• الوضع الآمن المحسن: ' + window.location.origin + '/?mode=ultimate-safe');
console.log('• وضع الطوارئ: ' + window.location.origin + '/?emergency=true');
console.log('• اختبار النظام: ' + window.location.origin + '/quick-start.html');

// Additional system info
console.log('\n💻 معلومات النظام:');
console.log('المتصفح:', navigator.userAgent);
console.log('اللغة:', navigator.language);
console.log('الاتجاه:', document.dir || 'غير محدد');
console.log('العرض:', window.innerWidth + 'x' + window.innerHeight);

// Auto-fix suggestions
if (failed > 0) {
  console.log('\n🔧 اقتراحات الإصلاح:');
  console.log('1. امسح Local Storage: localStorage.clear()');
  console.log('2. امسح Session Storage: sessionStorage.clear()');
  console.log('3. أعد تحميل الصفحة: location.reload()');
  console.log('4. جرب الوضع الآمن: location.href = "/?mode=ultimate-safe"');
}

console.log('\n✨ انتهى اختبار النظام!');

// Return test results for programmatic use
window.testResults = {
  passed,
  failed,
  total: tests.length,
  success: failed === 0,
  needsSafeMode: failed > 0 && failed <= 2,
  needsEmergencyMode: failed > 2
};