# DIYOR — santexnika lid-sayti (Next.js)

Kuchli taklif + forma → lid Telegram botga tushadi → menejer lidni baholaydi va sotuvni belgilaydi →
hammasi **Meta Pixel + Conversions API** orqali Metaga qaytadi (sifatli lid, xarid summasi, LTV).

## Ishga tushirish
```bash
npm install
cp .env.example .env.local   # qiymatlarni to'ldiring
npm run dev                  # http://localhost:3000
```

## Deploy (Vercel)
1. Loyihani Vercelga yuklang, `.env.example` dagi o'zgaruvchilarni Environment Variables ga kiriting.
2. Deploydan so'ng **bir marta** oching: `https://SAYT/api/telegram/setup?key=TELEGRAM_WEBHOOK_SECRET`
   — "⭐ Sifatli lid / 🚫 Sifatsiz" tugmalari ishlashi uchun webhook o'rnatiladi.
3. Botni lid tushadigan guruhga qo'shing. Chat ID: guruhga xabar yozing →
   `https://api.telegram.org/bot<TOKEN>/getUpdates` → `chat.id`.

## Metaga qaysi hodisalar ketadi

| Qachon | Hodisa | Qayerdan | Ma'lumot |
|---|---|---|---|
| Sahifa ochildi | `PageView` | Pixel | — |
| Formaga birinchi bosish | `FormStart` (custom) | Pixel | retarget uchun |
| Telefon / Instagram bosildi | `Contact` | Pixel | — |
| Forma yuborildi | `Lead` | Pixel + CAPI (bir xil `event_id` → dedup) | qiziqish turi |
| Telegramda **⭐ Sifatli lid** | `QualifiedLead` (custom) | CAPI | lead_id, kategoriya |
| **💰 Sotib oldi** → summa | `Purchase` | CAPI | `value`, `currency`, `purchase_number`, `customer_type: new`, `ltv` |
| **🔁 Qayta sotib oldi** → summa | `Purchase` + `RepeatPurchase` (custom) | CAPI | `customer_type: returning`, jami `ltv`, xarid raqami |

Barcha CAPI hodisalarida: heshlangan telefon, ism, external_id, mamlakat + fbp, fbc (reklama kliki), IP, brauzer —
yuqori Event Match Quality uchun.

**Events Manager'da qilinadigan ishlar:**
- `QualifiedLead` dan **Custom Conversion** yarating → kampaniyani shu konversiyaga optimizatsiya qiling (oddiy Lead emas, sifatli lid).
- `Purchase` → ROAS kampaniyalari; `RepeatPurchase` → doimiy mijozlar auditoriyasi / lookalike.
- Custom Audience: `Purchase` da `customer_type = returning` yoki `ltv > X` bo'yicha (value-based lookalike).

## Telegramdagi ish jarayoni
1. Lid keladi: ism, raqam, qiziqish, reklama manbai (utm) + yashirin texnik blok.
2. **📞 Qo'ng'iroq qilish** — raqam darhol teriladi.
3. **⭐ Sifatli lid / 🚫 Sifatsiz** — bir bosishda belgilanadi, sifatli bo'lsa Metaga ketadi.
4. **💰 Sotib oldi** — sahifa ochiladi, summa kiritiladi → Purchase. Javob xabarida LTV ko'rinadi.
5. Mijoz yana xarid qilsa — o'sha javobdagi **🔁 Qayta sotib oldi** tugmasi → yangi summa, LTV yig'iladi.

Ma'lumotlar bazasi kerak emas: lid ma'lumotlari Telegram xabarida, sotuv linklari esa AES-256-GCM
bilan shifrlangan (kalitsiz o'qib/o'zgartirib bo'lmaydi; standart amal muddati 365 kun).
Bir xarid ikki marta yuborilsa ham `event_id` bir xil — Meta takrorni o'chiradi.

## Matnlar
Barcha matnlar, brendlar, raqamlar, FAQ — `lib/site.ts`. Sahifa — `app/page.tsx`, dizayn — `app/globals.css`.
# Diyor-Premium-santexnikalari
