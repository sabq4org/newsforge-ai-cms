# 🌟 صحيفة سبق الذكية - نظام إدارة المحتوى الذكي

**نظام إدارة محتوى متطور مدعوم بالذكاء الاصطناعي للمؤسسات الإعلامية العربية**

## 🚀 التشغيل السريع (5 دقائق)

### 📋 المتطلبات
- Node.js 18+ 
- npm أو yarn
- متصفح حديث

### ⚡ التثبيت والتشغيل
```bash
# استنساخ المشروع
git clone https://github.com/sabq4org/newsforge-ai-cms.git
cd newsforge-ai-cms

# تثبيت التبعيات
npm install

# تشغيل المشروع
npm run dev
```

### 🌐 الوصول للنظام
- **الواجهة العامة**: http://localhost:5173
- **لوحة التحكم**: تسجيل دخول مطلوب
- **بيانات تجريبية**: admin / admin123

---

## 🏗️ التقنيات المستخدمة

### **المنصة الأساسية**
- **GitHub Spark Framework** - منصة التطوير السحابية
- **React 19.0.0** - مكتبة واجهة المستخدم
- **TypeScript** - لغة البرمجة المحسنة
- **Vite 6.3.5** - أداة البناء السريعة

### **التصميم والواجهة**
- **Tailwind CSS 4.0.17** - إطار العمل CSS
- **Radix UI** - مكونات واجهة المستخدم
- **IBM Plex Sans Arabic** - الخط العربي الرسمي
- **Phosphor Icons** - مكتبة الأيقونات

### **الذكاء الاصطناعي**
- **OpenAI GPT-4** - معالجة اللغة الطبيعية
- **ElevenLabs** - تحويل النص إلى صوت
- **تحليل المشاعر العربي** - فهم النصوص العربية
- **نظام التوصيات الذكي** - تخصيص المحتوى

---

## 🎯 الميزات الرئيسية

### **📰 إدارة المحتوى**
- محرر نصوص متقدم مع دعم المحتوى الغني
- نظام تصنيفات ذكي
- جدولة النشر التلقائي
- إدارة الوسائط المتقدمة

### **🧠 الذكاء الاصطناعي**
- **التحليل العميق**: تحليل المحتوى والمشاعر
- **التوصيات الذكية**: محتوى مخصص للقراء
- **الجرعات اليومية**: ملخصات ذكية حسب الوقت
- **محرر الصوت**: تحويل المقالات إلى بودكاست

### **📊 التحليلات المتقدمة**
- إحصائيات شاملة في الوقت الفعلي
- تحليل سلوك القراء
- A/B Testing للعناوين والمحتوى
- تقارير الأداء المفصلة

### **👥 إدارة المستخدمين**
- نظام أدوار متقدم (إداري، محرر، صحفي)
- العضوية العامة للقراء
- تخصيص التجربة الشخصية
- نظام الولاء والمكافآت

### **🌐 دعم اللغة العربية**
- اتجاه RTL كامل
- خطوط عربية محسنة
- معالجة النصوص العربية
- واجهة ثنائية اللغة

---

## 📂 هيكل المشروع

```
src/
├── 📁 components/          # مكونات النظام
│   ├── 📁 ui/              # مكونات Shadcn/ui الأساسية
│   ├── 📁 articles/        # إدارة المقالات والمحتوى
│   ├── 📁 analytics/       # التحليلات والإحصائيات
│   ├── 📁 audio/           # البودكاست والصوت
│   ├── 📁 dashboard/       # لوحة التحكم
│   ├── 📁 editor/          # محرر المحتوى
│   ├── 📁 membership/      # نظام العضوية
│   ├── 📁 public/          # الواجهة العامة
│   ├── 📁 recommendations/ # نظام التوصيات
│   └── 📁 settings/        # الإعدادات العامة
├── 📁 contexts/            # إدارة الحالة العامة
├── 📁 hooks/               # React Hooks مخصصة
├── 📁 lib/                 # مكتبات وأدوات مساعدة
├── 📁 services/            # خدمات API والبيانات
├── 📁 types/               # تعريفات TypeScript
└── 📁 assets/              # الوسائط والملفات الثابتة
```

---

## 🔧 حل المشاكل الشائعة

### **❌ الصفحة البيضاء**
```bash
# جرب الأوضاع الآمنة
http://localhost:5173?safe=true
http://localhost:5173?emergency=true
http://localhost:5173?minimal=true
```

### **❌ أخطاء التبعيات**
```bash
# إعادة تثبيت شاملة
rm -rf node_modules package-lock.json
npm install
```

### **❌ أخطاء TypeScript**
```bash
# فحص الأخطاء
npx tsc --noEmit

# تشغيل مع تجاهل الأخطاء مؤقتاً
npm run build -- --noCheck
```

### **🔍 تشخيص شامل للنظام**
```bash
# تشغيل أداة التشخيص
node diagnostic-tool.js
```

### **🏥 فحص سريع في المتصفح**
```javascript
// نسخ ولصق في وحدة تحكم المتصفح
// فحص React
console.log('React:', React?.version || 'غير متاح');

// فحص Spark
console.log('Spark:', typeof window.spark !== 'undefined' ? 'متاح' : 'غير متاح');

// فحص الخطوط العربية
console.log('Arabic Font:', document.fonts.check('16px "IBM Plex Sans Arabic"') ? 'محمل' : 'غير محمل');
```

---

## 📚 الأدلة والمراجع

- **📖 [دليل التقنيات المستخدمة](TECH_STACK_GUIDE.md)** - شرح شامل لجميع التقنيات
- **🚀 [دليل التشغيل السريع](QUICK_START_GUIDE.md)** - خطوات التشغيل المفصلة
- **🔧 [دليل إصلاح الأخطاء](TROUBLESHOOTING_GUIDE.md)** - حلول للمشاكل الشائعة
- **🎨 [دليل الثيمات](THEME_SYSTEM_GUIDE.md)** - تخصيص الألوان والتصميم

---

## 🧪 أوضاع التشغيل المختلفة

| الوضع | الرابط | الوصف |
|--------|---------|--------|
| **العادي** | `http://localhost:5173` | التشغيل الكامل مع جميع الميزات |
| **الآمن** | `?safe=true` | واجهة مبسطة لتشخيص المشاكل |
| **الاختبار** | `?test=true` | مكونات الاختبار فقط |
| **الطارئ** | `?emergency=true` | أدنى مستوى للطوارئ |
| **المبسط** | `?minimal=true` | واجهة أساسية بدون تعقيدات |

---

## 🌟 الميزات المميزة

### **🎙️ محرر البودكاست الذكي**
- تحويل المقالات تلقائياً إلى ملفات صوتية
- أصوات عربية طبيعية عالية الجودة
- تحرير صوتي متقدم مع تأثيرات

### **📈 نظام التوصيات المدعوم بالذكاء الاصطناعي**
- تحليل سلوك القراءة الشخصي
- توصيات محتوى مخصصة
- تعلم آلي متطور

### **⏰ الجرعات الذكية اليومية**
- محتوى مقسم حسب أوقات اليوم
- ملخصات ذكية ومخصصة
- توزيع تلقائي للأخبار

### **🔍 محرك البحث الذكي**
- بحث متقدم بالذكاء الاصطناعي
- فهم اللغة العربية الطبيعية
- نتائج مخصصة حسب السياق

---

## 📞 الدعم والمساعدة

### **الدعم الفني**
- 📧 **البريد الإلكتروني**: support@sabq.org
- 📱 **الهاتف**: 920000000
- 💬 **الدردشة المباشرة**: متاحة في الموقع

### **المطورين**
- 🐛 **تقارير الأخطاء**: [GitHub Issues](https://github.com/sabq4org/newsforge-ai-cms/issues)
- 📖 **الوثائق**: [GitHub Wiki](https://github.com/sabq4org/newsforge-ai-cms/wiki)
- 👥 **المجتمع**: [Discussions](https://github.com/sabq4org/newsforge-ai-cms/discussions)

### **الموارد الخارجية**
- 📚 [وثائق GitHub Spark](https://github.com/github/spark)
- ⚛️ [وثائق React 19](https://react.dev/)
- 🎨 [وثائق Tailwind CSS v4](https://tailwindcss.com/)
- 🧩 [مكونات Radix UI](https://www.radix-ui.com/)

---

## 🎯 خارطة الطريق

### **المرحلة الحالية (v1.0)**
- ✅ نظام إدارة المحتوى الأساسي
- ✅ الذكاء الاصطناعي للتحليل والتوصيات
- ✅ دعم اللغة العربية الكامل
- ✅ نظام العضوية والمستخدمين

### **المرحلة القادمة (v1.1)**
- 🔄 تحسينات الأداء والاستقرار
- 🔄 ميزات تعاون محسنة
- 🔄 تطبيق هاتف محمول
- 🔄 تكامل مع منصات التواصل

### **المستقبل (v2.0)**
- 📱 تطبيق أصلي للهواتف الذكية
- 🤖 ذكاء اصطناعي متقدم أكثر
- 🌍 دعم لغات إضافية
- ☁️ حلول سحابية متطورة

---

## 📄 الترخيص

هذا المشروع مرخص تحت [رخصة MIT](LICENSE) - راجع ملف الترخيص للمزيد من التفاصيل.

**حقوق النشر © 2024 صحيفة سبق الذكية. جميع الحقوق محفوظة.**

---

## 🙏 شكر وتقدير

نتقدم بالشكر الجزيل لـ:
- **GitHub** لمنصة Spark المتطورة
- **مجتمع React** للمكتبة الرائعة
- **فريق Tailwind CSS** لإطار العمل المرن
- **جميع المساهمين** في هذا المشروع

---

*🚀 صُمم بحب لخدمة الصحافة العربية الرقمية المتقدمة*