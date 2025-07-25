# دليل تخصيص مشروع سبق الذكية - Sabq Customization Guide

## تغيير ألوان المشروع | Changing Project Colors

### 📍 موقع تخصيص الألوان | Color Customization Location

يمكن تخصيص جميع ألوان المشروع من خلال تعديل ملف واحد:

**الملف:** `/src/index.css`
**القسم:** `:root` variables

### 🎨 شرح نظام الألوان | Color System Explanation

```css
:root {
  /* ألوان الخلفية الأساسية | Base Background Colors */
  --background: oklch(1 0 0);           /* خلفية الصفحة الرئيسية - أبيض */
  --foreground: oklch(0.15 0 0);        /* لون النص الأساسي - أسود داكن */
  --card: oklch(0.98 0 0);              /* خلفية البطاقات - أبيض مائل للرمادي */
  --card-foreground: oklch(0.15 0 0);   /* نص البطاقات */

  /* ألوان العمل والتفاعل | Action & Interactive Colors */
  --primary: oklch(0.25 0.08 250);      /* اللون الأساسي - أزرق داكن */
  --primary-foreground: oklch(1 0 0);   /* نص على اللون الأساسي - أبيض */
  
  --secondary: oklch(0.9 0 0);          /* لون ثانوي - رمادي فاتح */
  --secondary-foreground: oklch(0.2 0 0); /* نص على الثانوي */
  
  --accent: oklch(0.65 0.15 45);        /* لون التمييز - ذهبي عنبري */
  --accent-foreground: oklch(1 0 0);    /* نص على لون التمييز */

  /* ألوان التحذير والخطر | Warning & Danger Colors */
  --destructive: oklch(0.577 0.245 27.325); /* أحمر للحذف والتحذير */
  --destructive-foreground: oklch(1 0 0);   /* أبيض على الأحمر */

  /* ألوان العناصر التفاعلية | Interactive Element Colors */
  --border: oklch(0.9 0 0);             /* حدود العناصر */
  --input: oklch(0.9 0 0);              /* حدود صناديق الإدخال */
  --ring: oklch(0.25 0.08 250);         /* لون التركيز حول العناصر */
  
  --muted: oklch(0.95 0 0);             /* خلفيات مكتومة */
  --muted-foreground: oklch(0.45 0 0);  /* نص مكتوم */
}
```

### 🔧 كيفية تغيير الألوان | How to Change Colors

#### 1. تغيير اللون الأساسي (Primary Color)
```css
/* اللون الحالي: أزرق داكن */
--primary: oklch(0.25 0.08 250);

/* أمثلة بديلة: */
--primary: oklch(0.35 0.15 160);  /* أخضر */
--primary: oklch(0.45 0.20 290);  /* بنفسجي */
--primary: oklch(0.55 0.18 25);   /* برتقالي */
```

#### 2. تغيير لون التمييز (Accent Color)
```css
/* اللون الحالي: ذهبي عنبري */
--accent: oklch(0.65 0.15 45);

/* أمثلة بديلة: */
--accent: oklch(0.70 0.15 120);   /* أخضر فاتح */
--accent: oklch(0.60 0.20 300);   /* وردي */
--accent: oklch(0.65 0.18 200);   /* أزرق سماوي */
```

#### 3. إنشاء ثيم داكن | Creating Dark Theme
```css
:root {
  --background: oklch(0.1 0 0);         /* خلفية داكنة */
  --foreground: oklch(0.9 0 0);         /* نص فاتح */
  --card: oklch(0.15 0 0);              /* بطاقات داكنة */
  --card-foreground: oklch(0.9 0 0);    /* نص البطاقات فاتح */
  
  /* باقي الألوان تبقى كما هي أو تُعدّل قليلاً */
  --primary: oklch(0.4 0.15 250);       /* أزرق أفتح قليلاً */
  --muted: oklch(0.2 0 0);              /* رمادي داكن */
  --border: oklch(0.25 0 0);            /* حدود داكنة */
}
```

### 🎨 أمثلة ثيمات جاهزة | Ready-Made Theme Examples

#### ثيم الأخبار التقليدي | Traditional News Theme
```css
:root {
  --primary: oklch(0.2 0.05 240);       /* أزرق داكن كلاسيكي */
  --accent: oklch(0.5 0.25 30);         /* أحمر إخباري */
  --background: oklch(0.99 0 0);        /* أبيض ناصع */
}
```

#### ثيم التقنية | Technology Theme
```css
:root {
  --primary: oklch(0.3 0.12 270);       /* بنفسجي تقني */
  --accent: oklch(0.6 0.20 180);        /* أزرق-أخضر */
  --background: oklch(0.98 0.01 240);   /* أبيض مائل للأزرق */
}
```

#### ثيم السعودية | Saudi Arabia Theme
```css
:root {
  --primary: oklch(0.25 0.08 160);      /* أخضر السعودية */
  --accent: oklch(0.85 0.05 80);        /* ذهبي فاتح */
  --background: oklch(1 0 0);           /* أبيض نقي */
}
```

### 🔄 خطوات التطبيق | Application Steps

1. **افتح الملف** | Open the file: `/src/index.css`
2. **ابحث عن** | Find: `:root {`
3. **عدّل القيم** | Modify values: غيّر قيم `oklch()` حسب رغبتك
4. **احفظ الملف** | Save file: Ctrl+S أو ⌘+S
5. **شاهد التغيير** | See changes: سيتم التطبيق فورياً

### 📐 شرح نظام OKLCH

نستخدم نظام `oklch()` للألوان لأنه:
- **أكثر دقة** في توزيع الألوان
- **متوافق مع العين البشرية** 
- **سهل التعديل** بدون فقدان الجودة

**التركيب:** `oklch(Lightness Chroma Hue)`
- **Lightness (0-1):** الإضاءة (0 = أسود، 1 = أبيض)
- **Chroma (0-0.4):** التشبع (0 = رمادي، 0.4 = ملون جداً)
- **Hue (0-360):** درجة اللون (0 = أحمر، 120 = أخضر، 240 = أزرق)

### 🎯 نصائح التخصيص | Customization Tips

1. **ابدأ بلون واحد** واختبره قبل تغيير الباقي
2. **احرص على التباين** بين النص والخلفية
3. **استخدم أدوات اختبار الألوان** للتأكد من سهولة القراءة
4. **احفظ نسخة احتياطية** من الألوان الأصلية
5. **اختبر على شاشات مختلفة** وفي إضاءات متنوعة

### 🔧 أدوات مساعدة | Helpful Tools

- **Color Picker:** لاختيار الألوان بصرياً
- **Contrast Checker:** لفحص التباين
- **OKLCH Color Picker:** لتحويل الألوان لنظام OKLCH

---

## تغيير الخطوط | Changing Fonts

### 📝 الخط الحالي | Current Font
**الخط الأساسي:** IBM Plex Sans Arabic

### 🔄 تغيير الخط | Font Changing

1. **في ملف** `/index.html` - قم بتغيير رابط Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

2. **في ملف** `/src/index.css` - حدّث متغير الخط:
```css
html {
  font-family: 'Cairo', 'Inter', sans-serif;
}
```

### 📋 خطوط عربية مقترحة | Suggested Arabic Fonts
- **Cairo** - حديث ونظيف
- **Tajawal** - سهل القراءة  
- **Amiri** - تقليدي وأنيق
- **Noto Sans Arabic** - متوازن
- **Rubik** - عصري ومرن

---

هذا الدليل يغطي أساسيات تخصيص المشروع. للتخصيصات المتقدمة، راجع التوثيق التقني أو تواصل مع فريق التطوير.