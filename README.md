# اوهمیک (Ohmic)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Private-red)]()

مجموعه ابزارهای محاسباتی مدار برای کارهای روزمره الکترونیک: مقاومت معادل موازی، مقسم ولتاژ با انتخاب‌گر سری‌های تجاری `E24`/`E96` و فیلترهای پسیو `RC`/`RL`.

وقتی وسط طراحی شماتیک دنبال دو تا مقاومت استاندارد برای رسیدن به ولتاژ ۳.۳ ولت یا فرکانس قطع مشخصی می‌گردید، حساب‌کتاب دستی جفت‌های استاندارد و چک کردن افت ولتاژ زیر بار وقت‌گیر است. اوهمیک همین محاسبات را مستقیم و بدون شلوغی اضافی انجام می‌دهد.

---

## ابزارها

### ۱. مقاومت‌های موازی
- محاسبه مقاومت معادل ($R_{eq}$) و رسانایی کل مدار بر حسب زیمنس
- پشتیبانی از شاخه‌های متعدد با واحدهای $\Omega$، $\text{k}\Omega$ و $\text{M}\Omega$ و تعداد مقاومت‌های هم‌مقدار در هر شاخه
- نمایش سهم جریان عبوری هر شاخه به درصد
- شماتیک تعاملی با نمادهای استاندارد IEEE (زیگزاگ) و IEC (مستطیل)
- تشخیص اتصال کوتاه در صورت صفر بودن مقاومت هر شاخه

### ۲. مقسم ولتاژ (Voltage Divider)
- حل مستقیم و معکوس برای یافتن $R_1$ و $R_2$ بر اساس ولتاژ ورودی و خروجی هدف
- پیشنهاد خودکار جفت‌مقاومت‌های استاندارد سری‌های **E24** و **E96**
- رتبه‌بندی پیشنهادها بر اساس کمترین خطای ولتاژ یا کمترین تلفات توان
- پشتیبانی از مقاومت بار ($R_L$) و رسم منحنی افت ولتاژ تحت بار
- نمایش کد رنگی مقاومت‌ها و امکان خروجی برای ابزارهای EDA

### ۳. فیلترهای پسیو فرکانسی (RC / RL)
- محاسبه فرکانس قطع ($-3\,\text{dB}$)، ثابت زمانی ($\tau$) و زاویه فاز
- رسم دیاگرام بود (Bode Plot) دامنه و فاز در بازه ۴ دهه فرکانسی
- پیشنهاد نزدیک‌ترین قطعات تجاری استاندارد به فرکانس قطع مورد نظر
- شماتیک لحظه‌ای مدار فیلتر

---

## پشته فناوری

| لایه            | فناوری                          |
|-----------------|---------------------------------|
| فریمورک         | Next.js 15 (App Router)         |
| UI              | React 19 + Tailwind CSS 4       |
| کامپوننت‌ها     | Ark UI + Lucide React           |
| انیمیشن         | Motion                          |
| زبان            | TypeScript 5.9                  |
| استقرار         | GitHub Pages (Static Export)    |

---

## نصب و اجرا

```bash
git clone https://github.com/KavehAhangar051/ohmic-resistor-lab.git
cd ohmic-resistor-lab
npm install
npm run dev
```

پروژه روی آدرس [http://localhost:3000](http://localhost:3000) بالا می‌آید.

### دستورات پروژه

| دستور            | کاربرد                                    |
|------------------|-------------------------------------------|
| `npm run dev`    | اجرای سرور توسعه روی پورت ۳۰۰۰            |
| `npm run build`  | ساخت خروجی استاتیک تولید                  |
| `npm run check`  | بررسی تایپ‌ها (`tsc`) و لینت (`eslint`/`oxlint`) |
| `npm run lint`   | اجرای ESLint و Oxlint                     |

---

## ساختار پروژه (خلاصه)

```
ohmic-lab/
├── app/                    # صفحات و layout اصلی (App Router)
├── components/
│   ├── layout/             # پوسته اصلی اپلیکیشن
│   ├── resistor-calculator/# ابزار مقاومت موازی + شماتیک
│   ├── voltage-divider/    # ابزار مقسم ولتاژ
│   ├── passive-filter/     # ابزار فیلتر پسیو + Bode
│   ├── schematic-core/     # المان‌های پایه شماتیک (مشترک)
│   └── ui/                 # کامپوننت‌های پایه رابط کاربری
├── lib/                    # موتورهای محاسبه (فیزیک مدار)
│   ├── resistor-calc.ts
│   ├── voltage-divider-*.ts
│   ├── passive-filter-calc.ts
│   └── e-series.ts         # سری‌های استاندارد E24 / E96
├── types/                  # تعاریف TypeScript
├── hooks/                  # هوک‌های سفارشی
└── public/                 # فونت‌ها و دارایی‌های استاتیک
```

جزئیات معماری و جریان داده در فایل‌های [`ARCHITECTURE.md`](ARCHITECTURE.md) و [`DESIGN.md`](DESIGN.md) توضیح داده شده است.

---

## قواعد کدنویسی

قوانین توسعه در [`GEMINI.md`](GEMINI.md) و [`AGENTS.md`](AGENTS.md) ثبت شده‌اند. فایل‌ها را کوچک (حدود ۲۰۰ تا ۳۰۰ خط) نگه دارید، از بازنویسی کامل فایل‌ها برای تغییرات جزئی خودداری کنید و قبل از هر کامیت مطمئن شوید `npm run check` بدون خطا اجرا می‌شود.
