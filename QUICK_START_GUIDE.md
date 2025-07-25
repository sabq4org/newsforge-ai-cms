# 🚀 دليل التشغيل السريع - صحيفة سبق الذكية

## ⚡ التشغيل السريع (5 دقائق)

### **1. متطلبات النظام**
```bash
# تأكد من وجود Node.js الإصدار 18 أو أحدث
node --version  # يجب أن يكون >= 18.0.0
npm --version   # أو yarn --version
```

### **2. تثبيت المشروع**
```bash
# استنساخ المستودع
git clone https://github.com/sabq4org/newsforge-ai-cms.git
cd newsforge-ai-cms

# تثبيت الحزم
npm install

# تشغيل المشروع
npm run dev
```

### **3. الوصول للنظام**
```
🌐 الواجهة الأمامية: http://localhost:5173
👤 تسجيل الدخول: admin / admin123
🔧 لوحة التحكم: متاحة بعد تسجيل الدخول
```

---

## 🔧 حل المشاكل الشائعة

### **❌ مشكلة: أخطاء التبعيات**
```bash
# حذف وإعادة تثبيت الحزم
rm -rf node_modules package-lock.json
npm install

# أو تجربة التنظيف الكامل
npm cache clean --force
npm install
```

### **❌ مشكلة: أخطاء TypeScript**
```bash
# إعادة بناء أنواع TypeScript
npx tsc --noEmit

# تشغيل مع تجاهل الأخطاء مؤقتاً
npm run build -- --noCheck
```

### **❌ مشكلة: الصفحة البيضاء**
```bash
# تشغيل في الوضع الآمن
# أضف ?safe=true إلى نهاية الرابط
http://localhost:5173?safe=true

# أو الوضع الطارئ
http://localhost:5173?emergency=true
```

### **❌ مشكلة: أخطاء الخطوط العربية**
```css
/* إضافة إلى index.css */
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&display=swap');
```

### **❌ مشكلة: أخطاء Tailwind CSS**
```bash
# إعادة بناء Tailwind
npx tailwindcss build -i ./src/index.css -o ./dist/output.css

# تنظيف الكاش
rm -rf .vite
npm run dev
```

---

## 🧪 أوضاع التشغيل المختلفة

### **1. الوضع العادي (Production)**
```bash
npm run dev
# الرابط: http://localhost:5173
```

### **2. الوضع الآمن (Safe Mode)**
```bash
# يشغل واجهة مبسطة لتشخيص المشاكل
http://localhost:5173?safe=true
```

### **3. وضع الاختبار (Test Mode)**
```bash
# يشغل مكونات الاختبار فقط
http://localhost:5173?test=true
```

### **4. الوضع الطارئ (Emergency Mode)**
```bash
# أدنى مستوى من الميزات للطوارئ
http://localhost:5173?emergency=true
```

### **5. الوضع المبسط (Minimal Mode)**
```bash
# واجهة أساسية بدون تبعيات معقدة
http://localhost:5173?minimal=true
```

---

## 📂 هيكل المشروع الرئيسي

```
newsforge-ai-cms/
├── 📁 src/
│   ├── 📁 components/        # مكونات النظام
│   │   ├── 📁 ui/            # مكونات Shadcn/ui
│   │   ├── 📁 articles/      # إدارة المقالات
│   │   ├── 📁 analytics/     # التحليلات
│   │   ├── 📁 audio/         # البودكاست والصوت
│   │   ├── 📁 categories/    # التصنيفات
│   │   ├── 📁 dashboard/     # لوحة التحكم
│   │   ├── 📁 editor/        # المحرر
│   │   ├── 📁 layout/        # التخطيط
│   │   ├── 📁 membership/    # النظام العضوية
│   │   ├── 📁 public/        # الواجهة العامة
│   │   ├── 📁 recommendations/ # التوصيات
│   │   └── 📁 settings/      # الإعدادات
│   ├── 📁 contexts/          # إدارة الحالة العامة
│   ├── 📁 hooks/             # React Hooks مخصصة
│   ├── 📁 lib/               # مكتبات وأدوات
│   ├── 📁 services/          # خدمات API
│   ├── 📁 types/             # تعريفات TypeScript
│   └── 📁 assets/            # الوسائط والملفات
├── 📄 package.json           # تبعيات المشروع
├── 📄 vite.config.ts         # إعدادات Vite
├── 📄 tailwind.config.js     # إعدادات Tailwind
└── 📄 tsconfig.json          # إعدادات TypeScript
```

---

## 🎛️ المتغيرات البيئية

### **إنشاء ملف `.env.local`**
```bash
# إعدادات GitHub Spark
GITHUB_TOKEN=your_github_token_here

# إعدادات OpenAI (للذكاء الاصطناعي)
OPENAI_API_KEY=your_openai_key_here

# إعدادات ElevenLabs (للصوت)
ELEVENLABS_API_KEY=sk_8867323770dae548ec436056590d60a04ba9a8e1840ea09c

# إعدادات التطوير
VITE_DEV_MODE=true
VITE_DEBUG_MODE=false
```

---

## 🔍 اختبار صحة النظام

### **1. فحص التبعيات**
```bash
# فحص وجود جميع الحزم المطلوبة
npm ls

# فحص الحزم القديمة
npm outdated

# تحديث الحزم
npm update
```

### **2. فحص TypeScript**
```bash
# فحص الأخطاء
npx tsc --noEmit

# فحص مع التفاصيل
npx tsc --noEmit --listFiles
```

### **3. فحص ESLint**
```bash
# فحص جودة الكود
npm run lint

# إصلاح تلقائي
npm run lint -- --fix
```

---

## 🐛 تشخيص المشاكل المتقدمة

### **1. أخطاء الذاكرة**
```bash
# زيادة حد الذاكرة
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
```

### **2. أخطاء الشبكة**
```bash
# تنظيف DNS Cache
sudo dscacheutil -flushcache

# استخدام DNS بديل
export DNS_SERVER=8.8.8.8
```

### **3. أخطاء الأذونات**
```bash
# إصلاح أذونات الملفات
chmod -R 755 .
chown -R $USER:$USER .
```

---

## 📊 مراقبة الأداء

### **1. مراقبة استخدام الذاكرة**
```bash
# في وحدة التحكم المتصفح
console.log(performance.memory);
```

### **2. مراقبة سرعة التحميل**
```bash
# تشغيل تحليل الحزم
npm run build
npx vite-bundle-analyzer dist
```

### **3. مراقبة الشبكة**
- افتح Developer Tools
- انتقل إلى Network
- راقب طلبات البيانات

---

## 🔧 أدوات التطوير المفيدة

### **1. ملحقات VSCode مفيدة**
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint"
  ]
}
```

### **2. إعدادات Git مفيدة**
```bash
# إعداد Git للمشروع
git config user.name "اسمك"
git config user.email "your.email@example.com"

# إعداد RTL في commit messages
git config core.quotepath false
```

### **3. اختصارات مفيدة**
```bash
# إعداد aliases مفيدة
echo 'alias sabq-dev="npm run dev"' >> ~/.bashrc
echo 'alias sabq-build="npm run build"' >> ~/.bashrc
echo 'alias sabq-clean="rm -rf node_modules package-lock.json && npm install"' >> ~/.bashrc
```

---

## 📞 الحصول على المساعدة

### **1. الموارد الرسمية**
- 📖 [وثائق GitHub Spark](https://github.com/github/spark)
- 📖 [وثائق React](https://react.dev/)
- 📖 [وثائق Tailwind CSS](https://tailwindcss.com/)

### **2. المجتمع**
- 💬 مجتمع المطورين العرب
- 🐛 تقارير الأخطاء على GitHub Issues
- 💡 اقتراحات التحسين

### **3. الدعم الفني**
- 📧 البريد الإلكتروني: support@sabq.org
- 💬 الدردشة المباشرة في الموقع
- 📱 الهاتف: 920000000

---

## ✅ قائمة تحقق سريعة

- [ ] Node.js 18+ مثبت
- [ ] npm أو yarn متاح
- [ ] Git مكوّن بشكل صحيح
- [ ] متصفح حديث (Chrome, Firefox, Safari, Edge)
- [ ] اتصال إنترنت مستقر
- [ ] مساحة قرص كافية (2GB+)
- [ ] ذاكرة وصول عشوائي كافية (4GB+)

---

*🚀 إذا واجهت أي مشاكل، لا تتردد في طلب المساعدة من الفريق التقني*