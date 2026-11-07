# معماری فنی و جریان داده (`ARCHITECTURE.md`)

## ۱. ساختار پوشه‌ها و ماژول‌ها

```text
/
├── app/
│   ├── layout.tsx                           # Root Layout، فونت‌های محلی و متادیتا
│   ├── page.tsx                             # سوئیچینگ ۳ ابزار آزمایشگاهی
│   ├── globals.css                          # توکن‌های رنگ، فونت‌ها و Tailwind CSS 4
│   ├── error.tsx / global-error.tsx         # مرزهای خطای زمان اجرا (Error Boundaries)
│   └── not-found.tsx                        # صفحه 404
├── components/
│   ├── layout/AppShell.tsx                  # هدر مهندسی، ناوبری تب‌ها و فوتر
│   ├── resistor-calculator/                 # آزمایشگاه مقاومت‌های موازی
│   │   ├── ResistorCalculatorView.tsx       # کانتینر وضعیت شبکه موازی
│   │   ├── CircuitSchematic.tsx             # بوم شماتیک برداری SVG
│   │   ├── ResistorRow.tsx                  # ردیف ورودی شاخه و کد رنگی
│   │   ├── ResultDisplay.tsx                # نمایشگر مقاومت معادل و رسانایی
│   │   └── schematic/                       # اجزای شاخه، باس‌ها و ترمینال‌های موازی
│   ├── voltage-divider/                     # آزمایشگاه مقسم ولتاژ
│   │   ├── VoltageDividerView.tsx           # کانتینر وضعیت مقسم ولتاژ
│   │   ├── DividerSchematic.tsx             # شماتیک برداری مقسم ولتاژ و بار RL
│   │   ├── DividerParameterRow.tsx          # ردیف ورودی ولتاژ و مقاومت بار
│   │   ├── DividerResultDisplay.tsx         # نمایشگر تئونن، توان و جریان
│   │   ├── DividerStandardPairPicker.tsx    # جدول انتخاب‌گر جفت مقاومت‌های E24/E96
│   │   ├── DividerPairFilterBar.tsx         # نوار فیلتر حالت کاربرد، سری و جریان
│   │   ├── DividerPairTableRow.tsx          # سطر جدول جفت‌های پیشنهادی
│   │   ├── DividerTableSortHeader.tsx       # هدر مرتب‌سازی ستون‌های جدول
│   │   └── ResistorColorCodeBadge.tsx       # بج کد رنگی ۴ نواره EIA
│   ├── passive-filter/                      # آزمایشگاه فیلترهای پسیو RC و RL
│   │   ├── PassiveFilterView.tsx            # کانتینر وضعیت فیلتر فرکانسی
│   │   ├── FilterSchematic.tsx              # شماتیک مدار فیلتر با منبع AC
│   │   ├── FilterBodePlot.tsx               # نمودار بُد (دامنه dB و فاز) در ۴ دهه
│   │   ├── FilterResultDisplay.tsx          # نمایشگر فرکانس قطع، ثابت زمانی و تضعیف
│   │   └── FilterStandardPicker.tsx         # پیشنهاد جفت قطعات استاندارد E24/E12
│   ├── schematic-core/                      # المان‌های پایه SVG (Resistor, Ground, Node, Pad, PowerPort, Card)
│   ├── custom-cursor/                       # نشانگر ماوس شتاب‌یافته سخت‌افزاری (LERP RAF)
│   ├── motion/loader.tsx                    # اسپینر متنی ASCII Line (`| / - \`)
│   └── ui/                                  # کامپوننت‌های پایه UI (Button, Card, Input, Badge, Tooltip)
├── lib/
│   ├── resistor-calc.ts                     # محاسبات شبکه موازی (رسانایی G) و مدیریت شاخه‌ها
│   ├── resistor-color-code.ts               # کدگذار ۴ نواره رنگ مقاومت (IEC 60062) با کش محدود
│   ├── voltage-divider-calc.ts              # سرویس ارزیابی فضای کاری مقسم ولتاژ، تئونن و توان
│   ├── voltage-divider-solver.ts            # حل‌کننده‌های تحلیلی معادلات (`solveR1`, `solveR2`, `solveVin`, `getEffectiveR2`)
│   ├── voltage-divider-pair-finder.ts       # جستجوگر و مرتب‌ساز جفت مقاومت‌های تجاری E24/E96
│   ├── voltage-divider-pair-scoring.ts      # امتیازدهی امپدانس ADC، پایداری بایاس و سفتی بار
│   ├── voltage-divider-format.ts            # تبدیل واحد و فرمت مهندسی (`toOhms`, `toVolts`, `decomposeOhms`)
│   ├── passive-filter-calc.ts               # محاسبات فیلتر RC/RL، تابع تبدیل و تصویرسازی نمودار بُد
│   ├── e-series.ts                          # جداول استاندارد سری‌های E12، E24 و E96
│   ├── utils.ts                             # ترکیب کلاس‌ها (`cn`) و پاک‌سازی ورودی عددی (`sanitizeNumericInput`)
│   └── clean-architecture.test.ts           # تست‌های واحد مرز ماژول‌ها (`node:test`)
└── types/
    ├── resistor.ts                          # تایپ‌ها و جدول ضرایب واحد مقاومت (`RESISTOR_UNIT_MAP`)
    ├── voltage-divider.ts                   # تایپ‌های مقسم ولتاژ و جفت‌های استاندارد
    └── passive-filter.ts                    # تایپ‌های فیلتر پسیو و مختصات نمودار بُد
```

---

## ۲. قانون وابستگی و لایه‌بندی (PoEAA & Clean Architecture)

جریان وابستگی‌ها یک‌طرفه و رو به داخل است (`app/components` $\rightarrow$ `lib` $\rightarrow$ `types`):

| لایه | مسیر | مسئولیت | محدودیت |
| :--- | :--- | :--- | :--- |
| **Presentation Layer** | `app/`, `components/` | وضعیت تعامل کاربر، رندرینگ SVG و جدول‌ها | فاقد فرمول‌های فیزیک مدار و تبدیل واحد دستی |
| **Service / Facade Layer** | `lib/*-calc.ts`, `lib/*-pair-finder.ts` | هماهنگی سناریوها، ترکیب وضعیت و تولید DTO خروجی | بدون وابستگی به React، DOM یا Next.js |
| **Domain / Table Modules** | `lib/*-solver.ts`, `lib/e-series.ts`, `lib/*-scoring.ts` | معادلات جبری مدار، امتیازدهی مهندسی و جداول EIA | توابع خالص (Pure Functions) و سینگلتون‌های تغییرناپذیر |
| **Value Objects & Contracts** | `types/*.ts` | قراردادهای داده (DTO)، واحدها و ضرایب پایه | بدون هیچ‌گونه وابستگی خارجی |

---

## ۳. مرز ماژول‌های عمیق (Deep Module Seams)

| زمینه (Bounded Context) | نقطه ورود (Entry Seam) | ورودی | خروجی (DTO) | تضمین‌ها (Invariants) |
| :--- | :--- | :--- | :--- | :--- |
| **مقاومت موازی** | `calculateParallelResistance` | `ResistorItem[]` | `ParallelCalculationResult` | تشخیص اتصال کوتاه ($R=0\rightarrow R_{eq}=0$)، حفظ حداقل ۱ شاخه در `removeResistorBranch` |
| **مقسم ولتاژ** | `evaluateVoltageDividerWorkspace` | `VoltageDividerState`, `PairSortCriterion` | `VoltageDividerWorkspaceEvaluation` | محاسبه $R_{2,\text{eff}} = R_2 \parallel R_L$، تطبیق امپدانس تئونن با هدف `sampling`/`biasing`/`reference` |
| **فیلتر پسیو RC/RL** | `calculatePassiveFilter` + `buildBodePlotProjection` | `FilterState`, `BodeViewport` | `FilterCalculationResult`, `BodePlotProjection` | جاروب ۴ دهه لاگاریتمی حول $f_c$ ($0.01f_c$ تا $100f_c$)، حفظ واحد خازنی/سلفی در `applyStandardFilterPair` |

---

## ۴. معادلات پایه فیزیک مدار

1. **شبکه موازی (مبتنی بر رسانایی $G$)**:
   $$G_{\text{total}} = \sum_{k=1}^N \frac{\text{count}_k}{R_k}, \quad R_{eq} = \frac{1}{G_{\text{total}}}, \quad \text{Share}_k = \frac{G_k}{G_{\text{total}}} \times 100\%$$
2. **مقسم ولتاژ تحت بار ($R_L$)**:
   $$R_{2,\text{eff}} = \frac{R_2 \cdot R_L}{R_2 + R_L}, \quad V_{\text{out}} = V_{\text{in}} \frac{R_{2,\text{eff}}}{R_1 + R_{2,\text{eff}}}, \quad R_{\text{th}} = \frac{R_1 \cdot R_2}{R_1 + R_2}$$
3. **فیلتر پسیو مرتبه اول (RC / RL)**:
   $$f_{c,\text{RC}} = \frac{1}{2\pi R C}, \quad f_{c,\text{RL}} = \frac{R}{2\pi L}, \quad |H(f)|_{\text{LP}} = \frac{1}{\sqrt{1 + (f/f_c)^2}}, \quad |H(f)|_{\text{HP}} = \frac{f/f_c}{\sqrt{1 + (f/f_c)^2}}$$


